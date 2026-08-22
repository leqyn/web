// Chuyển đổi tab/mục nội dung
function showSection(sectionId) {
  // Ẩn tất cả các section
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Xóa class active ở thanh menu
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Hiển thị section được chọn
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Active đường dẫn tương ứng trên nav
  const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Xử lý sự kiện nộp Hộp thư góp ý
document.getElementById('feedback-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const sender = document.getElementById('sender').value;
  const message = document.getElementById('message').value;

  if (message.trim() !== '') {
    alert('Cảm ơn ý kiến đóng góp của thầy/cô! Ý kiến đã được gửi tới Tổ trưởng.');
    this.reset();
  }
});