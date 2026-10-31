const duplicateRepository = require('../repositories/duplicate.repository');

// Chuẩn hóa tên tiếng Việt
function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Đếm số ký tự cần thay đổi giữa hai chuỗi
function levenshtein(a, b) {
  const previous = Array.from(
    { length: b.length + 1 },
    (_, i) => i
  );

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j < current.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

// Tính độ tương đồng tên từ 0 đến 1
function nameSimilarity(nameA, nameB) {
  const a = normalizeText(nameA);
  const b = normalizeText(nameB);

  if (!a || !b) return 0;
  if (a === b) return 1;

  const distance = levenshtein(a, b);

  return 1 - distance / Math.max(a.length, b.length);
}

// Kiểm tra hai khách hàng có dấu hiệu nghi trùng
function isPotentialDuplicate(a, b) {
  const nameA = normalizeText(a.full_name);
  const nameB = normalizeText(b.full_name);

  const emailA = String(a.email || '').trim().toLowerCase();
  const emailB = String(b.email || '').trim().toLowerCase();

  const phoneA = String(a.phone || '').replace(/\D/g, '');
  const phoneB = String(b.phone || '').replace(/\D/g, '');

  const addressA = normalizeText(a.address);
  const addressB = normalizeText(b.address);

  const similarity = nameSimilarity(nameA, nameB);

  // Quy tắc 1: Email trùng hoàn toàn
  if (emailA && emailB && emailA === emailB) {
    return true;
  }

  // Quy tắc 2: Tên gần giống + 7 số đầu điện thoại trùng
  if (
    similarity >= 0.8 &&
    phoneA.length === 10 &&
    phoneB.length === 10 &&
    phoneA.slice(0, 7) === phoneB.slice(0, 7)
  ) {
    return true;
  }

  // Quy tắc 3: Tên giống hoàn toàn + địa chỉ giống nhau
  if (
    nameA.length >= 5 &&
    nameA === nameB &&
    addressA.length >= 5 &&
    addressA === addressB
  ) {
    return true;
  }

  return false;
}

// Quét hồ sơ đang hoạt động và lưu các cặp nghi trùng
async function scanDuplicates() {
  const customers =
    await duplicateRepository.findActiveCustomersForScan();

  let detected = 0;
  let created = 0;

  for (let i = 0; i < customers.length; i++) {
    for (let j = i + 1; j < customers.length; j++) {
      const a = customers[i];
      const b = customers[j];

      if (!isPotentialDuplicate(a, b)) {
        continue;
      }

      detected++;

      // Chỉ thêm nếu cặp này chưa tồn tại (kể cả đảo A/B)
      const wasCreated =
        await duplicateRepository.insertCandidateIfNotExists(
          a.customer_id,
          b.customer_id
        );

      if (wasCreated) {
        created++;
      }
    }
  }

  return {
    message: 'Quét hồ sơ nghi trùng thành công.',
    total_customers: customers.length,
    detected_pairs: detected,
    new_pairs: created
  };
}

module.exports = {
  normalizeText,
  nameSimilarity,
  isPotentialDuplicate,
  scanDuplicates
};
