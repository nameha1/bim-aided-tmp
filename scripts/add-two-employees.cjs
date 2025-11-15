/**
 * Add Two Additional Dummy Employees
 * Creates employee records with auth accounts for emp2 and emp3
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const auth = admin.auth();

// New employee data
const newEmployees = [
  {
    id: 'emp-002',
    eid: 'EMP002',
    firstName: 'Ayesha',
    lastName: 'Khan',
    email: 'emp2@gmail.com',
    phone: '01788543210',
    gender: 'Female',
    date_of_birth: '1999-08-14',
    national_id: '9876543210',
    tin: '147258',
    address: 'Chittagong, Bangladesh',
    department: 'Engineering & Technical',
    sub_department: 'Structural Analysis',
    designation: 'Structural Engineer',
    hire_date: '2024-10-12',
    gross_salary: 75000,
    bank_name: 'Eastern Bank Ltd',
    bank_account_number: '224466',
    bank_branch: 'Gulshan',
    bank_routing_number: '095432112',
    emergency_person_name: 'Farzana Rahman',
    emergency_person_contact: '01844556677',
    emergency_person_address: 'Gulshan 1, Dhaka',
    status: 'active',
    password: 'Test@123456',
    ip_address: '192.168.1.104'
  },
  {
    id: 'emp-003',
    eid: 'EMP003',
    firstName: 'Md. Karim',
    lastName: 'Ahmed',
    email: 'emp3@gmail.com',
    phone: '01622334455',
    gender: 'Male',
    date_of_birth: '1998-03-05',
    national_id: '5566778899',
    tin: '369258',
    address: 'Sylhet, Bangladesh',
    department: 'Executive & Management Level',
    sub_department: 'Project Coordination',
    designation: 'Assistant Project Manager',
    hire_date: '2023-02-15',
    gross_salary: 90000,
    bank_name: 'Dutch-Bangla Bank Ltd',
    bank_account_number: '778899',
    bank_branch: 'Mirpur',
    bank_routing_number: '123987654',
    emergency_person_name: 'Md. Hasan Ali',
    emergency_person_contact: '01933445566',
    emergency_person_address: 'Mirpur DOHS, Dhaka',
    status: 'active',
    password: 'Test@123456',
    ip_address: '192.168.1.105'
  }
];

async function addTwoEmployees() {
  console.log('\n🚀 Adding Two Additional Dummy Employees\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  try {
    const createdEmployees = [];
    
    for (const emp of newEmployees) {
      console.log(`👤 Creating: ${emp.firstName} ${emp.lastName}`);
      console.log(`   Email: ${emp.email}`);
      
      // Create Firebase Auth user
      let authUser;
      try {
        authUser = await auth.getUserByEmail(emp.email);
        console.log(`   ⏭️  Auth user already exists: ${authUser.uid}`);
        
        // Update password if needed
        await auth.updateUser(authUser.uid, { password: emp.password });
      } catch (error) {
        authUser = await auth.createUser({
          email: emp.email,
          password: emp.password,
          displayName: `${emp.firstName} ${emp.lastName}`,
          emailVerified: true
        });
        console.log(`   ✓ Created auth user: ${authUser.uid}`);
      }

      // Create/update employee document
      const { id, password, ip_address, ...employeeData } = emp;
      const employeeRef = db.collection('employees').doc(id);
      
      await employeeRef.set({
        ...employeeData,
        name: `${emp.firstName} ${emp.lastName}`,
        auth_uid: authUser.uid,
        supervisor_id: null,
        profile_image_url: null,
        document_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Created employee record: ${id}`);

      // Create user document
      await db.collection('users').doc(authUser.uid).set({
        email: emp.email,
        displayName: `${emp.firstName} ${emp.lastName}`,
        role: 'employee',
        employee_id: id,
        auth_uid: authUser.uid,
        created_at: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`   ✓ Created user document`);

      // Set user role
      await db.collection('user_roles').doc(authUser.uid).set({
        role: 'employee',
        email: emp.email,
        employee_id: id,
        created_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Set user role: employee`);

      // Whitelist IP address
      const ipRef = db.collection('ip_whitelist').doc();
      await ipRef.set({
        ip_address: ip_address,
        employee_id: id,
        employee_name: `${emp.firstName} ${emp.lastName}`,
        description: `IP for ${emp.firstName} ${emp.lastName}`,
        status: 'active',
        created_at: new Date().toISOString()
      });
      
      console.log(`   ✓ Whitelisted IP: ${ip_address}`);

      // Create leave balance for 2025
      const leaveBalanceRef = db.collection('leave_balances').doc(id);
      await leaveBalanceRef.set({
        employee_id: id,
        casual_leave: 10,
        sick_leave: 10,
        annual_leave: 0,
        unpaid_leave: 0,
        year: 2025,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Created leave balance: 10 casual, 10 sick leave`);
      
      createdEmployees.push({ 
        id, 
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        designation: emp.designation,
        salary: emp.gross_salary,
        auth_uid: authUser.uid 
      });
      
      console.log(`   ✅ ${emp.firstName} ${emp.lastName} - Complete!\n`);
    }

    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('✅ EMPLOYEE CREATION COMPLETE!\n');
    console.log('📋 Created Employees:\n');
    
    createdEmployees.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.name}`);
      console.log(`      Email: ${emp.email}`);
      console.log(`      ID: ${emp.id}`);
      console.log(`      Designation: ${emp.designation}`);
      console.log(`      Salary: ৳${emp.salary.toLocaleString()}`);
      console.log(`      Auth UID: ${emp.auth_uid}\n`);
    });

    console.log('🔐 Login Credentials:');
    console.log('   Email: emp2@gmail.com | Password: Test@123456');
    console.log('   Email: emp3@gmail.com | Password: Test@123456\n');

    console.log('💡 Next Steps:');
    console.log('   1. Login to admin panel');
    console.log('   2. View employees in the admin dashboard');
    console.log('   3. Add attendance records if needed');
    console.log('   4. Generate payroll when ready\n');

  } catch (error) {
    console.error('❌ Error creating employees:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
addTwoEmployees().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
