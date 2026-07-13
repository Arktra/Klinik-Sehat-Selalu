# Dokumentasi API - Klinik Sehat Selalu 🏥

Semua request wajib menyertakan header berikut jika memerlukan autentikasi:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 1. Users & Auth Endpoints (`/api/users`)

### Login User
- **Method & Route**: `POST /api/users/login`
- **Autentikasi**: Tidak
- **Request Body**:
  ```json
  {
    "username": "patient1",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "username": "patient1",
        "name": "Budi Santoso",
        "role": "patient"
      }
    }
  }
  ```

### Pendaftaran Pasien Mandiri (Public Register)
- **Method & Route**: `POST /api/users/register`
- **Autentikasi**: Tidak (Membuat user dengan role `patient` secara default)
- **Request Body**:
  ```json
  {
    "username": "budi123",
    "password": "password123",
    "name": "Budi Santoso"
  }
  ```

### Pembuatan User Baru (Admin Only)
- **Method & Route**: `POST /api/users`
- **Autentikasi**: Ya (`admin`)
- **Request Body**:
  ```json
  {
    "username": "dr_siti",
    "password": "securepassword",
    "name": "Dr. Siti Aminah",
    "role": "doctor"
  }
  ```

### Ambil Profil Pribadi
- **Method & Route**: `GET /api/users/profile`
- **Autentikasi**: Ya (Semua Role)

### Ambil User Berdasarkan Role
- **Method & Route**: `GET /api/users/role/:role`
- **Autentikasi**: Ya (`admin`)

### Ambil Seluruh User
- **Method & Route**: `GET /api/users`
- **Autentikasi**: Ya (`admin`)

### Ambil User Berdasarkan ID
- **Method & Route**: `GET /api/users/:id`
- **Autentikasi**: Ya (`admin`)

### Perbarui User (Admin Only)
- **Method & Route**: `PUT /api/users/:id`
- **Autentikasi**: Ya (`admin`)
- **Request Body** (Semua Opsional):
  ```json
  {
    "username": "dr_siti_baru",
    "password": "newsecurepassword",
    "name": "Dr. Siti Aminah M.Si",
    "role": "doctor"
  }
  ```

### Hapus User (Admin Only)
- **Method & Route**: `DELETE /api/users/:id`
- **Autentikasi**: Ya (`admin`)

---

## 2. Patients Endpoints (`/api/patients`)

### Pendaftaran Profil Pasien Mandiri
- **Method & Route**: `POST /api/patients/register`
- **Autentikasi**: Ya (`patient`)
- **Request Body**:
  ```json
  {
    "nik": "3171010101010001",
    "gender": "L",
    "birth_date": "1990-05-15",
    "phone": "081234567890",
    "address": "Jl. Mawar No. 12, Jakarta"
  }
  ```

### Pendaftaran Profil Pasien (Admin Only)
- **Method & Route**: `POST /api/patients`
- **Autentikasi**: Ya (`admin`)
- **Request Body**:
  ```json
  {
    "user_id": 3,
    "nik": "3171010101010002",
    "gender": "P",
    "birth_date": "1992-08-20",
    "phone": "081298765432",
    "address": "Jl. Melati No. 4, Jakarta"
  }
  ```

### Ambil Seluruh Pasien
- **Method & Route**: `GET /api/patients`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Ambil Pendaftaran Antrean Saya (Patient Self)
- **Method & Route**: `GET /api/patients/my-registrations`
- **Autentikasi**: Ya (`patient`)

### Ambil Pasien Berdasarkan NIK
- **Method & Route**: `GET /api/patients/nik/:nik`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Ambil Pasien Berdasarkan User ID
- **Method & Route**: `GET /api/patients/user/:userId`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Ambil Pasien Berdasarkan ID
- **Method & Route**: `GET /api/patients/:id`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Perbarui Pasien
- **Method & Route**: `PUT /api/patients/:id`
- **Autentikasi**: Ya (`admin` atau `patient` terkait pemilik profil)
- **Request Body** (Semua Opsional, `user_id` tidak dapat diubah):
  ```json
  {
    "nik": "3171010101019999",
    "gender": "P",
    "birth_date": "1992-08-21",
    "phone": "081298765000",
    "address": "Jl. Melati Baru No. 4, Jakarta"
  }
  ```

### Hapus Pasien (Admin Only)
- **Method & Route**: `DELETE /api/patients/:id`
- **Autentikasi**: Ya (`admin`)

---

## 3. Registrations Endpoints (`/api/registrations`)

### Membuat Pendaftaran Baru
- **Method & Route**: `POST /api/registrations`
- **Autentikasi**: Ya (Semua Role terautentikasi dengan profil pasien)
- **Request Body**:
  ```json
  {
    "complaint": "Demam tinggi sejak 2 hari yang lalu dan batuk kering.",
    "previous_history": "Tidak ada riwayat alergi obat."
  }
  ```

### Ambil Seluruh Pendaftaran
- **Method & Route**: `GET /api/registrations`
- **Autentikasi**: Ya (`admin`, `administrative`)

### Ambil Pendaftaran berdasarkan Status
- **Method & Route**: `GET /api/registrations/status/:status`
- **Autentikasi**: Ya (`admin`, `administrative`)
- **Status yang Valid**: `pending`, `verified`, `rejected`

### Ambil Pendaftaran Berdasarkan ID
- **Method & Route**: `GET /api/registrations/:id`
- **Autentikasi**: Ya (Semua Role)

### Perbarui Pendaftaran (Hanya untuk status 'pending')
- **Method & Route**: `PUT /api/registrations/:id`
- **Autentikasi**: Ya (`admin`, `administrative`)
- **Request Body** (Hanya kolom ini yang diperbolehkan):
  ```json
  {
    "complaint": "Demam tinggi sejak 3 hari disertai pusing berat.",
    "previous_history": "Riwayat asma ringan."
  }
  ```

### Hapus Pendaftaran (Hanya untuk status 'pending')
- **Method & Route**: `DELETE /api/registrations/:id`
- **Autentikasi**: Ya (`admin`)

### Verifikasi Pendaftaran Pasien (Membuka Antrean)
- **Method & Route**: `PATCH /api/registrations/:id/verify`
- **Autentikasi**: Ya (`admin`, `administrative`)
- **Deskripsi**: Mengubah status pendaftaran menjadi `verified` dan otomatis membuat baris antrean baru (`Queue`) dengan status `waiting`.

### Tolak Pendaftaran Pasien
- **Method & Route**: `PATCH /api/registrations/:id/reject`
- **Autentikasi**: Ya (`admin`, `administrative`)
- **Deskripsi**: Mengubah status pendaftaran menjadi `rejected`.

---

## 4. Queues Endpoints (`/api/queues`)

### Ambil Antrean Berikutnya (Ambil Antrean oleh Perawat)
- **Method & Route**: `PATCH /api/queues/take-next`
- **Autentikasi**: Ya (`nurse`)
- **Deskripsi**: Mengambil antrean pertama dengan status `waiting`, mengubah statusnya menjadi `nurse`, dan menetapkan `nurse_id` ke user perawat yang login.

### Ambil Antrean berdasarkan Status
- **Method & Route**: `GET /api/queues/status/:status`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Status yang Valid**: `waiting`, `nurse`, `doctor`, `cashier`, `done`

### Ambil Seluruh Antrean
- **Method & Route**: `GET /api/queues`
- **Autentikasi**: Ya (`admin`, `nurse`)

### Ambil Antrean Berdasarkan ID
- **Method & Route**: `GET /api/queues/:id`
- **Autentikasi**: Ya (Semua Role)

### Membuat Entri Antrean Manual
- **Method & Route**: `POST /api/queues`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Request Body**:
  ```json
  {
    "registration_id": 1
  }
  ```

### Perbarui Antrean
- **Method & Route**: `PUT /api/queues/:id`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Request Body** (Hanya status yang diperbolehkan diubah secara manual):
  ```json
  {
    "status": "doctor"
  }
  ```

### Hapus Antrean (Admin Only)
- **Method & Route**: `DELETE /api/queues/:id`
- **Autentikasi**: Ya (`admin`)

### Perbarui Status Antrean secara Manual
- **Method & Route**: `PATCH /api/queues/:id/status`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Request Body**:
  ```json
  {
    "status": "cashier"
  }
  ```

---

## 5. Nurse Exams Endpoints (`/api/nurse-exams`)

### Membuat Pemeriksaan Fisik Perawat
- **Method & Route**: `POST /api/nurse-exams`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Request Body**:
  ```json
  {
    "queue_id": 1,
    "blood_pressure": "120/80",
    "temperature": 36.5,
    "spo2": 98,
    "height": 170,
    "weight": 65.2,
    "notes": "Pasien dalam kondisi sadar penuh, tekanan darah normal."
  }
  ```
- **Otomatisasi**: Mengubah status antrean terkait menjadi `doctor` agar dokter dapat memeriksa pasien selanjutnya.

### Ambil Pemeriksaan Fisik Berdasarkan Queue ID
- **Method & Route**: `GET /api/nurse-exams/queue/:queueId`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Ambil Seluruh Pemeriksaan Fisik
- **Method & Route**: `GET /api/nurse-exams`
- **Autentikasi**: Ya (`admin`, `nurse`, `doctor`)

### Ambil Pemeriksaan Fisik Berdasarkan ID
- **Method & Route**: `GET /api/nurse-exams/:id`
- **Autentikasi**: Ya (Semua Role)

### Perbarui Pemeriksaan Fisik
- **Method & Route**: `PUT /api/nurse-exams/:id`
- **Autentikasi**: Ya (`admin`, `nurse`)
- **Request Body** (Semua Opsional, `queue_id` dan `nurse_id` tidak dapat diubah):
  ```json
  {
    "temperature": 37.2,
    "notes": "Pemeriksaan ulang suhu tubuh pasien."
  }
  ```

### Hapus Pemeriksaan Fisik (Admin Only)
- **Method & Route**: `DELETE /api/nurse-exams/:id`
- **Autentikasi**: Ya (`admin`)

---

## 6. Diagnoses Endpoints (`/api/diagnoses`)

### Membuat Diagnosis Dokter
- **Method & Route**: `POST /api/diagnoses`
- **Autentikasi**: Ya (`admin`, `doctor`)
- **Request Body**:
  ```json
  {
    "queue_id": 1,
    "diagnosis_text": "Influenza akut dengan gejala demam dan batuk.",
    "actions": "Diberikan istirahat cukup dan resep obat demam.",
    "notes": "Kontrol kembali jika 3 hari demam tidak turun."
  }
  ```
- **Otomatisasi**: Mengubah status antrean terkait menjadi `cashier`.

### Ambil Diagnosis Berdasarkan Queue ID
- **Method & Route**: `GET /api/diagnoses/queue/:queueId`
- **Autentikasi**: Ya (`admin`, `doctor`, `nurse`)

### Ambil Seluruh Diagnosis
- **Method & Route**: `GET /api/diagnoses`
- **Autentikasi**: Ya (`admin`, `doctor`, `nurse`)

### Ambil Diagnosis Berdasarkan ID
- **Method & Route**: `GET /api/diagnoses/:id`
- **Autentikasi**: Ya (Semua Role)

### Perbarui Diagnosis
- **Method & Route**: `PUT /api/diagnoses/:id`
- **Autentikasi**: Ya (`admin`, `doctor`)
- **Request Body** (Semua Opsional, `queue_id` dan `doctor_id` tidak dapat diubah):
  ```json
  {
    "diagnosis_text": "Influenza akut sedang.",
    "notes": "Ditambahkan anjuran hindari air es."
  }
  ```

### Hapus Diagnosis (Admin Only)
- **Method & Route**: `DELETE /api/diagnoses/:id`
- **Autentikasi**: Ya (`admin`)

---

## 7. Prescriptions Endpoints (`/api/prescriptions`)

### Membuat Resep Obat Dokter
- **Method & Route**: `POST /api/prescriptions`
- **Autentikasi**: Ya (`admin`, `doctor`)
- **Request Body**:
  ```json
  {
    "diagnosis_id": 1,
    "medicine_name": "Paracetamol 500mg",
    "dosage": "3x1 tablet sehari setelah makan",
    "instructions": "Diminum jika demam di atas 38C",
    "advice": "Minum banyak air putih."
  }
  ```

### Ambil Seluruh Resep Berdasarkan Diagnosis ID
- **Method & Route**: `GET /api/prescriptions/diagnosis/:diagnosisId`
- **Autentikasi**: Ya (`admin`, `pharmacist`, `doctor`, `patient`)

### Ambil Seluruh Resep
- **Method & Route**: `GET /api/prescriptions`
- **Autentikasi**: Ya (`admin`, `pharmacist`, `doctor`)

### Ambil Resep Berdasarkan ID
- **Method & Route**: `GET /api/prescriptions/:id`
- **Autentikasi**: Ya (`admin`, `pharmacist`, `doctor`, `patient`)

### Perbarui Resep
- **Method & Route**: `PUT /api/prescriptions/:id`
- **Autentikasi**: Ya (`admin`, `doctor`)
- **Request Body** (Semua Opsional, `diagnosis_id` tidak dapat diubah):
  ```json
  {
    "dosage": "3x1 tablet sehari (diperlukan konsisten)"
  }
  ```

### Hapus Resep (Admin Only)
- **Method & Route**: `DELETE /api/prescriptions/:id`
- **Autentikasi**: Ya (`admin`)

---

## 8. Payments Endpoints (`/api/payments`)

### Membuat Tagihan Pembayaran
- **Method & Route**: `POST /api/payments`
- **Autentikasi**: Ya (`admin`, `cashier`)
- **Request Body**:
  ```json
  {
    "diagnosis_id": 1,
    "doctor_fee": 50000,
    "treatment_fee": 20000,
    "drug_fee": 35000
  }
  ```
- **Otomatisasi**: Field `total` dihitung otomatis secara virtual (`doctor_fee` + `treatment_fee` + `drug_fee`). Kasir ID otomatis terisi dari akun kasir yang login jika tidak dikirim.

### Proses Pembayaran Kasir (Selesai Pembayaran)
- **Method & Route**: `PATCH /api/payments/:id/process`
- **Autentikasi**: Ya (`admin`, `cashier`)
- **Deskripsi**: Mengubah status pembayaran menjadi `paid`, merekam waktu pembayaran (`paid_at`), dan memperbarui status antrean terkait menjadi `done`.

### Ambil Pendapatan Harian
- **Method & Route**: `GET /api/payments/daily-revenue/:date` atau `/api/payments/daily-revenue`
- **Autentikasi**: Ya (`admin`, `cashier`)
- **Response**: Mengembalikan rekapitulasi jumlah transaksi dan total pendapatan per kategori biaya pada tanggal tersebut.

### Ambil Seluruh Tagihan Pembayaran
- **Method & Route**: `GET /api/payments`
- **Autentikasi**: Ya (`admin`, `cashier`)

### Ambil Tagihan Pembayaran Berdasarkan Diagnosis ID
- **Method & Route**: `GET /api/payments/diagnosis/:diagnosisId`
- **Autentikasi**: Ya (Semua Role)

### Ambil Tagihan Pembayaran Berdasarkan ID
- **Method & Route**: `GET /api/payments/:id`
- **Autentikasi**: Ya (Semua Role)

### Perbarui Tagihan Pembayaran
- **Method & Route**: `PUT /api/payments/:id`
- **Autentikasi**: Ya (`admin`, `cashier`)
- **Request Body** (Semua Opsional, `diagnosis_id` dan `cashier_id` tidak dapat diubah):
  ```json
  {
    "doctor_fee": 60000,
    "drug_fee": 40000
  }
  ```

### Hapus Tagihan Pembayaran (Admin Only)
- **Method & Route**: `DELETE /api/payments/:id`
- **Autentikasi**: Ya (`admin`)
