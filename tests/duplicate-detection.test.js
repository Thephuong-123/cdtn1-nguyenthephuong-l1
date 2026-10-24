
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeText,
  nameSimilarity,
  isPotentialDuplicate
} = require('../src/services/duplicate-detection.service');

// TC01: Chuẩn hóa tên tiếng Việt
test('TC01 - Chuan hoa ten tieng Viet', () => {
  const result = normalizeText('  Nguyễn   Văn  An  ');

  assert.equal(result, 'nguyen van an');
});

// TC02: Hai tên giống nhau có độ tương đồng 100%
test('TC02 - Ten giong nhau', () => {
  const result = nameSimilarity(
    'Nguyễn Văn An',
    'nguyen van an'
  );

  assert.equal(result, 1);
});

// TC03: Hai hồ sơ trùng email
test('TC03 - Phat hien trung email', () => {
  const a = {
    full_name: 'Nguyen Van An',
    phone: '0901111222',
    email: 'test@gmail.com',
    address: 'Ca Mau'
  };

  const b = {
    full_name: 'Tran Van B',
    phone: '0912222333',
    email: 'TEST@gmail.com',
    address: 'Ha Noi'
  };

  assert.equal(isPotentialDuplicate(a, b), true);
});

// TC04: Tên gần giống và 7 số đầu điện thoại trùng
test('TC04 - Phat hien ten gan giong va SDT gan giong', () => {
  const a = {
    full_name: 'Nguyen Van Test',
    phone: '0901111222',
    email: 'a@gmail.com',
    address: 'Ca Mau'
  };

  const b = {
    full_name: 'Nguyen Van Tet',
    phone: '0901111333',
    email: 'b@gmail.com',
    address: 'Ca Mau'
  };

  assert.equal(isPotentialDuplicate(a, b), true);
});

// TC05: Tên giống nhau và địa chỉ giống nhau
test('TC05 - Phat hien trung ten va dia chi', () => {
  const a = {
    full_name: 'Nguyen Van An',
    phone: '0901111222',
    email: null,
    address: 'Ca Mau'
  };

  const b = {
    full_name: 'Nguyễn Văn An',
    phone: '0988888999',
    email: null,
    address: 'Cà Mau'
  };

  assert.equal(isPotentialDuplicate(a, b), true);
});

// TC06: Hai hồ sơ khác nhau không bị đánh dấu nghi trùng
test('TC06 - Khong phat hien trung khi thong tin khac', () => {
  const a = {
    full_name: 'Nguyen Van An',
    phone: '0901111222',
    email: 'an@gmail.com',
    address: 'Ca Mau'
  };

  const b = {
    full_name: 'Tran Thi Binh',
    phone: '0988888999',
    email: 'binh@gmail.com',
    address: 'Ha Noi'
  };

  assert.equal(isPotentialDuplicate(a, b), false);
});

// TC07: Không bị lỗi khi thiếu email hoặc địa chỉ
test('TC07 - Xu ly du lieu thieu', () => {
  const a = {
    full_name: 'Nguyen Van An',
    phone: '0901111222',
    email: null,
    address: null
  };

  const b = {
    full_name: 'Tran Thi Binh',
    phone: '0988888999',
    email: null,
    address: null
  };

  assert.equal(isPotentialDuplicate(a, b), false);
});
