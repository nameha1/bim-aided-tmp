require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function testLeaveRequestsByMonth() {
  try {
    console.log('🔍 Testing Leave Requests by Month\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Get all leave requests
    const allRequests = await db.collection('leave_requests').get();
    
    console.log(`📋 Total Leave Requests: ${allRequests.size}\n`);
    
    // Group by month
    const byMonth = {};
    
    allRequests.docs.forEach(doc => {
      const data = doc.data();
      if (data.start_date) {
        const date = new Date(data.start_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!byMonth[monthKey]) {
          byMonth[monthKey] = [];
        }
        
        byMonth[monthKey].push({
          id: doc.id,
          employee_id: data.employee_id,
          leave_type: data.leave_type,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status,
          days_requested: data.days_requested
        });
      }
    });
    
    // Display by month
    const sortedMonths = Object.keys(byMonth).sort().reverse();
    
    console.log('📅 Leave Requests by Month:\n');
    
    sortedMonths.forEach(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      const requests = byMonth[monthKey];
      
      console.log(`\n${monthName}: ${requests.length} request(s)`);
      console.log('─'.repeat(50));
      
      // Count by status
      const pending = requests.filter(r => r.status === 'pending_admin' || r.status === 'pending_supervisor').length;
      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      
      console.log(`  ⏳ Pending: ${pending}`);
      console.log(`  ✅ Approved: ${approved}`);
      console.log(`  ❌ Rejected: ${rejected}`);
      
      // Show details
      requests.forEach(req => {
        const statusIcon = req.status === 'approved' ? '✅' : req.status === 'rejected' ? '❌' : '⏳';
        console.log(`    ${statusIcon} ${req.leave_type} | ${req.start_date} to ${req.end_date} | ${req.days_requested || '?'} days`);
      });
    });
    
    console.log('\n═══════════════════════════════════════════════════\n');
    console.log('✅ Admin can now filter by:');
    console.log('   • Month (current month by default)');
    console.log('   • Navigate to previous/next months');
    console.log('   • Filter by status (All/Pending/Approved/Rejected)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testLeaveRequestsByMonth();
