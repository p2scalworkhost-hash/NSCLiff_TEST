# NSC LIFF Register Mock

Static mock web app สำหรับออกแบบ flow ลงทะเบียนพนักงานผ่าน LINE LIFF ครั้งแรก

ดีไซน์ปัจจุบันปรับเป็นโทนคลินิกความงามของ NSC ใช้สี rose, sage, white และโลโก้ NSC Specialist Surgery

## วิธีเปิดดู

เปิดไฟล์นี้ใน browser:

`index.html`

ยังไม่เชื่อม Firebase และยังไม่เชื่อม LINE LIFF จริง ข้อมูลถูกเก็บจำลองใน `localStorage`

## Flow ที่ทำแล้ว

- เปิดครั้งแรกแล้วเห็นหน้า register
- แสดงโลโก้ NSC Specialist Surgery
- กรอกชื่อจริง, นามสกุล, ชื่อเล่น, เบอร์โทร, แผนก, รหัสพนักงาน
- ถ้าไม่ใส่รหัสพนักงาน ระบบสร้าง `TEMP-xxxxxx`
- กดบันทึกแล้วแสดงสถานะ `registered`
- เลือกวันที่สำหรับลงเวลา, วันหยุด, หรือลาล่วงหน้า
- แสดงเวลาเด้งถาม OT อัตโนมัติจากเวลาเริ่มงาน + 9 ชั่วโมง
- กลับมาเปิดใหม่ ระบบจำว่า LINE userId นี้ลงทะเบียนแล้ว
- แก้ไขข้อมูลได้
- ล้างข้อมูลจำลองได้

## จุดที่จะเชื่อมจริงภายหลัง

- เปลี่ยน `mockLineProfile` ใน `app.js` เป็น `liff.getProfile()`
- เปลี่ยน `localStorage` เป็น Firebase Firestore
- เพิ่ม Firebase Auth หรือ custom token ถ้าต้องการ
- เพิ่ม rule ไม่ให้ LINE userId เดียวสมัครซ้ำหลายคน
- เพิ่ม rule ไม่ให้เบอร์โทรหรือ Employee_ID ซ้ำ
