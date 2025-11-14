/**
 * Initialize Leave Balances for All Active Employees
 * Run this script once to create initial leave balance records for the current year
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../bim-aided-firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function getLeaveSettings() {
  try {
    const settingsSnapshot = await db.collection('payroll_settings').get();
    const settings = {};
    
    settingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      settings[data.config_key] = data.config_value;
    });

    return {
      casualLeave: parseInt(settings.annual_casual_leave || '10'),
      sickLeave: parseInt(settings.annual_sick_leave || '10'),
    };
  } catch (error) {
    console.error('Error fetching leave settings:', error);
    return { casualLeave: 10, sickLeave: 10 };
  }
}

async function initializeLeaveBalances() {
  console.log('🏥 Initializing leave balances for all active employees...\n');
  
  const currentYear = new Date().getFullYear();
  
  try {
    // Get leave settings
    const settings = await getLeaveSettings();
    console.log(`📋 Leave Settings:`);
    console.log(`   Casual Leave: ${settings.casualLeave} days/year`);
    console.log(`   Sick Leave: ${settings.sickLeave} days/year\n`);

    // Get all active employees
    const employeesSnapshot = await db.collection('employees')
      .where('status', '==', 'active')
      .get();

    if (employeesSnapshot.empty) {
      console.log('⚠️  No active employees found!');
      process.exit(0);
    }

    console.log(`👥 Found ${employeesSnapshot.size} active employees\n`);

    const batch = db.batch();
    let created = 0;
    let skipped = 0;
    let updated = 0;

    for (const empDoc of employeesSnapshot.docs) {
      const employee = empDoc.data();
      const employeeId = empDoc.id;
      const employeeName = `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim();

      // Check if balance already exists for this year
      const existingBalance = await db.collection('leave_balances')
        .where('employee_id', '==', employeeId)
        .where('year', '==', currentYear)
        .get();

      if (existingBalance.empty) {
        // Create new balance
        const balanceRef = db.collection('leave_balances').doc();
        batch.set(balanceRef, {
          employee_id: employeeId,
          year: currentYear,
          casual_leave_total: settings.casualLeave,
          casual_leave_used: 0,
          casual_leave_remaining: settings.casualLeave,
          sick_leave_total: settings.sickLeave,
          sick_leave_used: 0,
          sick_leave_remaining: settings.sickLeave,
          unpaid_leave_days: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        created++;
        console.log(`  ✓ Creating balance for: ${employeeName || employeeId}`);
      } else {
        // Balance exists, check if it needs updating
        const existingData = existingBalance.docs[0].data();
        if (existingData.casual_leave_total !== settings.casualLeave || 
            existingData.sick_leave_total !== settings.sickLeave) {
          
          batch.update(existingBalance.docs[0].ref, {
            casual_leave_total: settings.casualLeave,
            sick_leave_total: settings.sickLeave,
            casual_leave_remaining: settings.casualLeave - (existingData.casual_leave_used || 0),
            sick_leave_remaining: settings.sickLeave - (existingData.sick_leave_used || 0),
            updated_at: new Date().toISOString(),
          });
          updated++;
          console.log(`  ↻ Updating balance for: ${employeeName || employeeId}`);
        } else {
          skipped++;
          console.log(`  ⊘ Skipping: ${employeeName || employeeId} (already exists)`);
        }
      }
    }

    if (created > 0 || updated > 0) {
      await batch.commit();
      console.log('\n✅ Successfully initialized leave balances!');
    } else {
      console.log('\n✅ All employee balances are up to date!');
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created} new balances`);
    console.log(`   Updated: ${updated} existing balances`);
    console.log(`   Skipped: ${skipped} (already up to date)`);
    console.log(`   Total Active Employees: ${employeesSnapshot.size}`);
    console.log(`\n💡 Employees can now view their leave balances in the dashboard!`);

  } catch (error) {
    console.error('❌ Error initializing leave balances:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the initialization
initializeLeaveBalances();
