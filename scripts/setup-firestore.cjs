/**
 * Firestore Database Setup Script
 * 
 * This script creates all necessary Firestore collections and adds sample data
 * Run with: node scripts/setup-firestore.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
} catch (error) {
  console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY');
  console.error('Make sure it\'s a valid JSON string in your .env.local file');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Collection schemas with sample data
const collections = {
  departments: [
    { id: 'dept-001', name: 'Engineering', description: 'Engineering Department', active: true },
    { id: 'dept-002', name: 'Architecture', description: 'Architecture Department', active: true },
    { id: 'dept-003', name: 'Project Management', description: 'Project Management Department', active: true },
    { id: 'dept-004', name: 'BIM Services', description: 'BIM Services Department', active: true },
    { id: 'dept-005', name: 'Administration', description: 'Administration Department', active: true }
  ],

  designations: [
    { id: 'desg-001', title: 'BIM Manager', level: 'Senior', department_id: 'dept-004' },
    { id: 'desg-002', title: 'Senior Architect', level: 'Senior', department_id: 'dept-002' },
    { id: 'desg-003', title: 'Project Manager', level: 'Senior', department_id: 'dept-003' },
    { id: 'desg-004', title: 'BIM Modeler', level: 'Junior', department_id: 'dept-004' },
    { id: 'desg-005', title: 'Structural Engineer', level: 'Mid', department_id: 'dept-001' },
    { id: 'desg-006', title: 'MEP Engineer', level: 'Mid', department_id: 'dept-001' },
    { id: 'desg-007', title: 'BIM Coordinator', level: 'Mid', department_id: 'dept-004' }
  ],

  projects: [
    {
      id: 'proj-001',
      title: 'Dubai Marina Tower',
      description: 'High-rise residential tower with 50 floors',
      client: 'Emaar Properties',
      location: 'Dubai, UAE',
      status: 'in_progress',
      start_date: '2024-01-15',
      end_date: '2026-06-30',
      project_type: 'Commercial',
      budget: 250000000,
      image_url: '/images/projects/project1.jpg',
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'proj-002',
      title: 'Abu Dhabi Cultural Center',
      description: 'Modern cultural center with exhibition halls and theater',
      client: 'Abu Dhabi Tourism',
      location: 'Abu Dhabi, UAE',
      status: 'completed',
      start_date: '2023-03-01',
      end_date: '2024-12-31',
      project_type: 'Cultural',
      budget: 180000000,
      image_url: '/images/projects/project2.jpg',
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'proj-003',
      title: 'Sharjah Healthcare Complex',
      description: 'State-of-the-art medical facility with 300 beds',
      client: 'Sharjah Health Authority',
      location: 'Sharjah, UAE',
      status: 'planning',
      start_date: '2025-01-01',
      end_date: '2027-12-31',
      project_type: 'Healthcare',
      budget: 320000000,
      image_url: '/images/projects/project3.jpg',
      featured: true,
      created_at: new Date().toISOString()
    }
  ],

  employees: [
    {
      id: 'emp-001',
      eid: 'BIM001',
      name: 'Admin User',
      email: 'admin@bimaided.com',
      phone: '+971501234567',
      department: 'Administration',
      designation: 'System Administrator',
      hire_date: '2024-01-01',
      status: 'active',
      salary: 15000,
      supervisor_id: null,
      created_at: new Date().toISOString()
    }
  ],

  contact_inquiries: [
    {
      id: 'inq-001',
      name: 'Sample Inquiry',
      email: 'sample@example.com',
      phone: '+971501234567',
      subject: 'Project Inquiry',
      message: 'This is a sample contact inquiry for testing purposes.',
      status: 'new',
      created_at: new Date().toISOString()
    }
  ],

  job_postings: [
    {
      id: 'job-001',
      title: 'Senior BIM Manager',
      department: 'BIM Services',
      location: 'Dubai, UAE',
      employment_type: 'full_time',
      description: 'We are seeking an experienced BIM Manager to lead our BIM department.',
      requirements: [
        '5+ years of BIM management experience',
        'Proficiency in Revit, Navisworks, and BIM 360',
        'Strong leadership skills',
        'PMP or similar certification preferred'
      ],
      responsibilities: [
        'Manage BIM team and projects',
        'Develop BIM standards and protocols',
        'Coordinate with clients and stakeholders',
        'Ensure quality control'
      ],
      salary_range: '15000-25000 AED',
      status: 'active',
      posted_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'job-002',
      title: 'Revit Modeler',
      department: 'BIM Services',
      location: 'Dubai, UAE',
      employment_type: 'full_time',
      description: 'Looking for skilled Revit modelers to join our growing team.',
      requirements: [
        '2+ years of Revit experience',
        'Knowledge of architectural/structural modeling',
        'Attention to detail',
        'Good communication skills'
      ],
      responsibilities: [
        'Create detailed BIM models',
        'Coordinate with design teams',
        'Update models based on feedback',
        'Maintain model quality'
      ],
      salary_range: '8000-12000 AED',
      status: 'active',
      posted_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ],

  attendance: [],
  leave_requests: [],
  assignments: [],
  assignment_members: [],
  transactions: [],
  invoices: [],
  ip_whitelist: [],
  holidays: [
    {
      id: 'hol-001',
      name: 'New Year',
      date: '2025-01-01',
      type: 'public',
      created_at: new Date().toISOString()
    },
    {
      id: 'hol-002',
      name: 'National Day',
      date: '2025-12-02',
      type: 'public',
      created_at: new Date().toISOString()
    }
  ]
};

async function setupFirestore() {
  console.log('🚀 Starting Firestore database setup...\n');

  try {
    // Check connection
    console.log('✓ Connected to Firebase Admin SDK');
    console.log(`✓ Project: ${serviceAccount.project_id}\n`);

    let totalDocs = 0;

    // Create collections with sample data
    for (const [collectionName, documents] of Object.entries(collections)) {
      console.log(`📁 Creating collection: ${collectionName}`);
      
      if (documents.length === 0) {
        console.log(`   ℹ️  No sample data for ${collectionName} (will be populated by users)`);
        continue;
      }

      for (const doc of documents) {
        const { id, ...data } = doc;
        const docRef = db.collection(collectionName).doc(id);
        
        // Check if document already exists
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          console.log(`   ⏭️  ${id} already exists, skipping...`);
          continue;
        }

        await docRef.set(data);
        console.log(`   ✓ Created document: ${id}`);
        totalDocs++;
      }
      
      console.log('');
    }

    console.log('─'.repeat(50));
    console.log(`\n✅ Database setup complete!`);
    console.log(`📊 Created ${totalDocs} documents across ${Object.keys(collections).length} collections\n`);

    // Create admin user if doesn't exist
    await setupAdminUser();

    console.log('─'.repeat(50));
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to Firebase Console → Firestore Database');
    console.log('2. Verify collections were created');
    console.log('3. Update security rules if needed');
    console.log('4. Test login with: admin@bimaided.com\n');

  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

async function setupAdminUser() {
  console.log('👤 Setting up admin user...');
  
  const adminEmail = 'admin@bimaided.com';
  const adminPassword = 'Admin@123456'; // Change this!
  
  try {
    // Check if user exists
    let user;
    try {
      user = await auth.getUserByEmail(adminEmail);
      console.log(`   ✓ Admin user already exists: ${user.uid}`);
    } catch (error) {
      // User doesn't exist, create it
      user = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Admin User',
        emailVerified: true
      });
      console.log(`   ✓ Created admin user: ${user.uid}`);
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword} (Please change this!)`);
    }

    // Set admin role in user_roles collection
    const roleRef = db.collection('user_roles').doc(user.uid);
    const roleSnap = await roleRef.get();
    
    if (!roleSnap.exists) {
      await roleRef.set({
        role: 'admin',
        email: adminEmail,
        created_at: new Date().toISOString()
      });
      console.log(`   ✓ Set admin role for user`);
    } else {
      console.log(`   ⏭️  Admin role already set`);
    }

    // Create user document in users collection
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      await userRef.set({
        email: adminEmail,
        displayName: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString()
      });
      console.log(`   ✓ Created user document`);
    } else {
      console.log(`   ⏭️  User document already exists`);
    }

  } catch (error) {
    console.error('   ❌ Error setting up admin user:', error.message);
    throw error;
  }
}

// Run setup
setupFirestore()
  .then(() => {
    console.log('✨ All done! You can now use the application.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
