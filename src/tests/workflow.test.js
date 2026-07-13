const request = require('supertest');
const app = require('../app');
const { sequelize, User, Patient, Registration, Queue, NurseExam, Diagnosis, Prescription, Payment } = require('../models');
const bcrypt = require('bcryptjs');

describe('Klinik Sehat Selalu End-to-End Workflow Integration Test', () => {
  let adminToken;
  let patientToken;
  let nurseToken;
  let doctorToken;
  let cashierToken;

  let patientId;
  let registrationId;
  let queueId;
  let diagnosisId;
  let paymentId;

  const testPatientUser = {
    username: 'testpatient',
    password: 'password123',
    name: 'Budi Santoso'
  };

  const testPatientProfile = {
    nik: '3171010101010001',
    gender: 'L',
    birth_date: '1990-05-15',
    phone: '081234567890',
    address: 'Jl. Melati No. 45, Jakarta'
  };

  const testStaffUsers = {
    admin: { username: 'testadmin', password: 'password123', name: 'Super Admin', role: 'admin' },
    nurse: { username: 'testnurse', password: 'password123', name: 'Nurse Clara', role: 'nurse' },
    doctor: { username: 'testdoctor', password: 'password123', name: 'Dr. John Doe', role: 'doctor' },
    cashier: { username: 'testcashier', password: 'password123', name: 'Cashier Alice', role: 'cashier' }
  };

  beforeAll(async () => {
    // Ensure database exists and tables are completely reset
    if (sequelize.ensureDatabaseExists) {
      await sequelize.ensureDatabaseExists();
    }
    await sequelize.sync({ force: true });

    // Seed the primary admin user directly into the database to bootstrap the system
    const hashedAdminPassword = await bcrypt.hash(testStaffUsers.admin.password, 12);
    await User.create({
      username: testStaffUsers.admin.username,
      password: hashedAdminPassword,
      name: testStaffUsers.admin.name,
      role: testStaffUsers.admin.role
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // 1. User Management & Authentications
  test('Should login as admin and create staff accounts (nurse, doctor, cashier)', async () => {
    // Login as Admin
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        username: testStaffUsers.admin.username,
        password: testStaffUsers.admin.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    adminToken = loginRes.body.data.token;
    expect(adminToken).toBeDefined();

    // Create Nurse
    const createNurseRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testStaffUsers.nurse);
    expect(createNurseRes.status).toBe(201);

    // Create Doctor
    const createDoctorRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testStaffUsers.doctor);
    expect(createDoctorRes.status).toBe(201);

    // Create Cashier
    const createCashierRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testStaffUsers.cashier);
    expect(createCashierRes.status).toBe(201);
  });

  test('Public registration should default role to patient and reject custom admin role', async () => {
    // Registering with custom role 'admin' in body, but endpoint must enforce 'patient' role
    const regRes = await request(app)
      .post('/api/users/register')
      .send({
        username: testPatientUser.username,
        password: testPatientUser.password,
        name: testPatientUser.name,
        role: 'admin' // Attempt privilege escalation
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.role).toBe('patient'); // Overwritten/enforced to patient
  });

  test('Should login as the patient and complete patient profile', async () => {
    // Login as Patient
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        username: testPatientUser.username,
        password: testPatientUser.password
      });

    expect(loginRes.status).toBe(200);
    patientToken = loginRes.body.data.token;

    // Create Patient Profile
    const profileRes = await request(app)
      .post('/api/patients/register')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(testPatientProfile);

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.success).toBe(true);
    patientId = profileRes.body.data.id;
    expect(patientId).toBeDefined();
  });

  // 2. Clinical Workflow - Step 1: Patient Registration
  test('Patient should create registration (starts as pending)', async () => {
    const regRes = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        complaint: 'Sakit tenggorokan dan badan terasa meriang selama 3 hari.',
        previous_history: 'Alergi obat amoxicillin.'
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.status).toBe('pending');
    registrationId = regRes.body.data.id;
  });

  // 3. Clinical Workflow - Step 2: Verification and Queue Creation
  test('Admin should verify registration, creating a queue with status waiting', async () => {
    const verifyRes = await request(app)
      .patch(`/api/registrations/${registrationId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.status).toBe('verified');
    expect(verifyRes.body.data.queue).toBeDefined();
    expect(verifyRes.body.data.queue.status).toBe('waiting');
    queueId = verifyRes.body.data.queue.id;
  });

  // 4. Clinical Workflow - Step 3: Nurse takes Queue
  test('Nurse should login and take the next waiting queue', async () => {
    // Login as Nurse
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        username: testStaffUsers.nurse.username,
        password: testStaffUsers.nurse.password
      });
    expect(loginRes.status).toBe(200);
    nurseToken = loginRes.body.data.token;

    // Take next queue
    const takeRes = await request(app)
      .patch('/api/queues/take-next')
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(takeRes.status).toBe(200);
    expect(takeRes.body.success).toBe(true);
    expect(takeRes.body.data.status).toBe('nurse');
    expect(takeRes.body.data.registration.nurse_id).toBeDefined();
  });

  // 5. Workflow Constraints - Security State checks
  test('Doctor should NOT be able to diagnose a patient while queue is in nurse stage', async () => {
    // Login as Doctor
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        username: testStaffUsers.doctor.username,
        password: testStaffUsers.doctor.password
      });
    expect(loginRes.status).toBe(200);
    doctorToken = loginRes.body.data.token;

    // Try to diagnose
    const diagRes = await request(app)
      .post('/api/diagnoses')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        queue_id: queueId,
        diagnosis_text: 'Meningitis ringan',
        actions: 'Rawat jalan'
      });

    expect(diagRes.status).toBe(400); // Bad Request (Queue state mismatch)
    expect(diagRes.body.success).toBe(false);
  });

  // 6. Clinical Workflow - Step 4: Nurse conducts Examination
  test('Nurse should submit physical examination, transitioning queue to doctor stage', async () => {
    const examRes = await request(app)
      .post('/api/nurse-exams')
      .set('Authorization', `Bearer ${nurseToken}`)
      .send({
        queue_id: queueId,
        temperature: 37.8,
        spo2: 99,
        blood_pressure: '120/80',
        height: 165,
        weight: 60,
        notes: 'Suhu tubuh agak hangat, tekanan darah normal.'
      });

    expect(examRes.status).toBe(201);
    expect(examRes.body.success).toBe(true);
    expect(examRes.body.data.queue.status).toBe('doctor');
  });

  // 7. Clinical Workflow - Step 5: Doctor Diagnoses and Prescribes
  test('Doctor should submit diagnosis and write prescriptions, transitioning queue to cashier stage', async () => {
    // Create Diagnosis
    const diagRes = await request(app)
      .post('/api/diagnoses')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        queue_id: queueId,
        diagnosis_text: 'Faringitis Akut (radang tenggorokan).',
        actions: 'Diberikan antibiotik ringan dan parasetamol.',
        notes: 'Banyak minum air hangat.'
      });

    expect(diagRes.status).toBe(201);
    expect(diagRes.body.success).toBe(true);
    expect(diagRes.body.data.queue.status).toBe('cashier');
    diagnosisId = diagRes.body.data.id;

    // Write Prescription
    const prescRes = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        diagnosis_id: diagnosisId,
        medicine_name: 'Amoxicillin 500mg',
        dosage: '3x1 tablet sehari',
        instructions: 'Habiskan obat antibiotik ini.',
        advice: 'Konsumsi setelah makan.'
      });

    expect(prescRes.status).toBe(201);
    expect(prescRes.body.success).toBe(true);
  });

  // 8. Clinical Workflow - Step 6: Cashier Bills and Processes Payment
  test('Cashier should generate payment bill and transition queue to done upon payment verification', async () => {
    // Login as Cashier
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        username: testStaffUsers.cashier.username,
        password: testStaffUsers.cashier.password
      });
    expect(loginRes.status).toBe(200);
    cashierToken = loginRes.body.data.token;

    // Create Payment Bill
    const billRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        diagnosis_id: diagnosisId,
        doctor_fee: 50000,
        treatment_fee: 10000,
        drug_fee: 25000
      });

    expect(billRes.status).toBe(201);
    expect(billRes.body.success).toBe(true);
    expect(billRes.body.data.total).toBe(85000); // 50k + 10k + 25k virtual getter total
    expect(billRes.body.data.status).toBe('unpaid');
    paymentId = billRes.body.data.id;

    // Process Payment
    const payRes = await request(app)
      .patch(`/api/payments/${paymentId}/process`)
      .set('Authorization', `Bearer ${cashierToken}`);

    expect(payRes.status).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.data.status).toBe('paid');
    expect(payRes.body.data.diagnosis.queue.status).toBe('done');
  });

  // 9. Financial Reporting - Daily Revenue
  test('Admin should retrieve daily revenue and verify transaction values', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const revenueRes = await request(app)
      .get(`/api/payments/daily-revenue/${todayStr}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(revenueRes.status).toBe(200);
    expect(revenueRes.body.success).toBe(true);
    expect(revenueRes.body.data.summary.total_transactions).toBe(1);
    expect(revenueRes.body.data.summary.total_revenue).toBe(85000);
    expect(revenueRes.body.data.summary.total_doctor_fee).toBe(50000);
    expect(revenueRes.body.data.summary.total_drug_fee).toBe(25000);
  });
});
