// Chuyển đổi tab/mục nội dung
const SUPABASE_URL = 'https://wgkbararpwapaovxfyvc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_L51kNyGALD2jfyAoUdplUA_xlKg-TZ7';
const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

// Quản lý danh sách thành viên trên trình duyệt hiện tại
const memberForm = document.getElementById('member-form');
const memberName = document.getElementById('member-name');
const memberRole = document.getElementById('member-role');
const memberFile = document.getElementById('member-file');
const memberList = document.getElementById('member-list');
const showMemberFormButton = document.getElementById('show-member-form');
const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');

showMemberFormButton.addEventListener('click', () => {
  memberForm.hidden = !memberForm.hidden;
  showMemberFormButton.textContent = memberForm.hidden ? 'Thêm' : 'Ẩn';

  if (!memberForm.hidden) {
    memberName.focus();
  }
});

function renderMembers() {
  memberList.innerHTML = '';

  members.forEach((member, index) => {
    const item = document.createElement('li');
    const details = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = member.name;
    details.appendChild(name);

    if (member.role) {
      details.append(` - ${member.role}`);
    }

    if (member.fileName && member.fileData) {
      const fileLink = document.createElement('a');
      fileLink.href = member.fileData;
      fileLink.download = member.fileName;
      fileLink.textContent = `Tải ${member.fileName}`;
      fileLink.className = 'member-file-link';
      fileLink.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
          const response = await fetch(member.fileData);
          const fileBlob = await response.blob();
          const temporaryUrl = URL.createObjectURL(fileBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = temporaryUrl;
          downloadLink.download = member.fileName;
          downloadLink.click();
          URL.revokeObjectURL(temporaryUrl);
        } catch (error) {
          alert('Không thể tải file này. Bạn hãy thử tải lại trang rồi thử lại.');
        }
      });
      details.append(' | ');
      details.appendChild(fileLink);
    }

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Xóa';
    removeButton.addEventListener('click', () => {
      members.splice(index, 1);
      localStorage.setItem('teamMembers', JSON.stringify(members));
      renderMembers();
    });

    item.appendChild(details);
    item.appendChild(removeButton);
    memberList.appendChild(item);
  });
}

memberForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const selectedFile = memberFile.files[0];
  const saveMember = (fileData = '') => {
    members.push({
      name: memberName.value.trim(),
      role: memberRole.value.trim(),
      fileName: selectedFile ? selectedFile.name : '',
      fileData
    });

    try {
      localStorage.setItem('teamMembers', JSON.stringify(members));
    } catch (error) {
      members.pop();
      alert('Không thể lưu file. File có thể quá lớn, bạn hãy chọn file nhỏ hơn.');
      return;
    }

    memberForm.reset();
    renderMembers();
    memberForm.hidden = true;
    showMemberFormButton.textContent = 'Thêm';
  };

  if (selectedFile) {
    const reader = new FileReader();
    reader.addEventListener('load', () => saveMember(reader.result));
    reader.readAsDataURL(selectedFile);
  } else {
    saveMember();
  }
});

renderMembers();

// Hiển thị bảng xem trước các file trong Thông báo nhanh
const noticeForm = document.getElementById('notice-form');
const noticeFilesInput = document.getElementById('notice-files');
const noticeTable = document.getElementById('notice-file-table');
const noticeTableBody = noticeTable.querySelector('tbody');
const showNoticeFormButton = document.getElementById('show-notice-form');
const noticeFiles = JSON.parse(localStorage.getItem('quickNoticeFiles') || '[]');
const noticeViewer = document.getElementById('notice-viewer');
const noticeViewerTitle = document.getElementById('notice-viewer-title');
const noticeViewerDownload = document.getElementById('notice-viewer-download');
const noticeViewerBody = document.getElementById('notice-viewer-body');
let noticePreviewUrl = '';

function displayWordContent(container, html) {
  container.innerHTML = '';
  const wordPage = document.createElement('article');
  wordPage.className = 'word-document-page';
  wordPage.innerHTML = html || 'File không có nội dung để xem trước.';
  container.appendChild(wordPage);
}

showNoticeFormButton.addEventListener('click', () => {
  noticeForm.hidden = !noticeForm.hidden;
  showNoticeFormButton.textContent = noticeForm.hidden ? 'Thêm' : 'Ẩn';
});

async function renderNoticePreview(noticeFile, previewCell) {
  if (!noticeFile.fileName.toLowerCase().endsWith('.docx')) {
    previewCell.textContent = 'File .doc cần mở bằng Word.';
    return;
  }

  try {
    const response = await fetch(noticeFile.fileData);
    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    previewCell.innerHTML = result.value || 'File không có nội dung để xem trước.';
  } catch (error) {
    previewCell.textContent = 'Không thể xem trước file này.';
  }
}

async function showNoticeFile(noticeFile) {
  noticeViewer.hidden = false;
  noticeViewerTitle.textContent = noticeFile.fileName;
  noticeViewerDownload.href = noticeFile.fileData;
  noticeViewerDownload.download = noticeFile.fileName;
  noticeViewerBody.innerHTML = '';

  if (noticePreviewUrl) {
    URL.revokeObjectURL(noticePreviewUrl);
    noticePreviewUrl = '';
  }

  const fileName = noticeFile.fileName.toLowerCase();
  if (fileName.endsWith('.pdf') || fileName.match(/\.(png|jpe?g|gif|webp|bmp)$/)) {
    const response = await fetch(noticeFile.fileData);
    const fileBlob = await response.blob();
    noticePreviewUrl = URL.createObjectURL(fileBlob);

    if (fileName.endsWith('.pdf')) {
      const frame = document.createElement('iframe');
      frame.src = noticePreviewUrl;
      frame.title = noticeFile.fileName;
      noticeViewerBody.appendChild(frame);
    } else {
      const image = document.createElement('img');
      image.src = noticePreviewUrl;
      image.alt = noticeFile.fileName;
      noticeViewerBody.appendChild(image);
    }
  } else if (fileName.match(/\.(mp4|webm|ogg|mov)$/)) {
    const response = await fetch(noticeFile.fileData);
    const fileBlob = await response.blob();
    noticePreviewUrl = URL.createObjectURL(fileBlob);
    const video = document.createElement('video');
    video.src = noticePreviewUrl;
    video.controls = true;
    noticeViewerBody.appendChild(video);
  } else if (fileName.endsWith('.docx')) {
    noticeViewerBody.textContent = 'Đang mở file...';
    try {
      const response = await fetch(noticeFile.fileData);
      const fileBlob = await response.blob();
      noticePreviewUrl = URL.createObjectURL(fileBlob);
      noticeViewerDownload.href = noticePreviewUrl;
      const arrayBuffer = await fileBlob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      displayWordContent(noticeViewerBody, result.value);
    } catch (error) {
      noticeViewerBody.textContent = 'Không thể xem trước file này.';
    }
  } else {
    noticeViewerBody.textContent = 'Định dạng này chưa hỗ trợ xem trực tiếp. Hãy bấm Tải xuống để mở file.';
  }
}

function renderNoticeFiles() {
  noticeTableBody.innerHTML = '';
  noticeTable.hidden = noticeFiles.length === 0;

  noticeFiles.forEach((noticeFile, index) => {
    const row = document.createElement('tr');
    const actionCell = document.createElement('td');
    const selectFileLink = document.createElement('a');
    selectFileLink.href = '#';
    selectFileLink.textContent = noticeFile.fileName;
    selectFileLink.className = 'notice-select-file-link';
    selectFileLink.addEventListener('click', event => {
      event.preventDefault();
      showNoticeFile(noticeFile);
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Xóa';
    removeButton.addEventListener('click', () => {
      noticeFiles.splice(index, 1);
      localStorage.setItem('quickNoticeFiles', JSON.stringify(noticeFiles));
      renderNoticeFiles();
    });
    actionCell.append(selectFileLink, removeButton);
    row.appendChild(actionCell);
    noticeTableBody.appendChild(row);
  });

  if (noticeFiles.length > 0) {
    showNoticeFile(noticeFiles[0]);
  } else {
    noticeViewer.hidden = true;
  }
}

noticeForm.addEventListener('submit', event => {
  event.preventDefault();
  const selectedFiles = Array.from(noticeFilesInput.files);
  const isImageFile = file => file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name);
  const isDocumentFile = file => /\.(pdf|doc|docx)$/i.test(file.name);
  const imageFiles = selectedFiles.filter(isImageFile);
  const documentFiles = selectedFiles.filter(isDocumentFile);
  const unsupportedFiles = selectedFiles.filter(file => !isImageFile(file) && !isDocumentFile(file));

  if (unsupportedFiles.length > 0 || documentFiles.length > 1 || (documentFiles.length > 0 && imageFiles.length > 0)) {
    alert('Chỉ được tải 1 file PDF hoặc Word, hoặc chọn nhiều file ảnh.');
    return;
  }

  const readFile = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve({
      fileName: file.name,
      fileSize: file.size,
      fileData: reader.result
    }));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

  Promise.all(selectedFiles.map(readFile)).then(uploadedFiles => {
    noticeFiles.push(...uploadedFiles);
    try {
      localStorage.setItem('quickNoticeFiles', JSON.stringify(noticeFiles));
      noticeForm.reset();
      renderNoticeFiles();
      noticeForm.hidden = true;
      showNoticeFormButton.textContent = 'Thêm';
    } catch (error) {
      noticeFiles.splice(-uploadedFiles.length, uploadedFiles.length);
      alert('Không thể lưu tệp. Tệp có thể quá lớn, bạn hãy chọn tệp nhỏ hơn.');
    }
  });
});

renderNoticeFiles();

// Quản lý lịch công tác và nội dung kiểm tra
const scheduleForm = document.getElementById('schedule-form');
const scheduleDate = document.getElementById('schedule-date');
const scheduleContent = document.getElementById('schedule-content');
const inspectionContent = document.getElementById('inspection-content');
const scheduleTable = document.getElementById('schedule-table');
const scheduleTableBody = scheduleTable.querySelector('tbody');
const showScheduleFormButton = document.getElementById('show-schedule-form');
const schedules = JSON.parse(localStorage.getItem('workSchedules') || '[]');

showScheduleFormButton.addEventListener('click', () => {
  scheduleForm.hidden = !scheduleForm.hidden;
  showScheduleFormButton.textContent = scheduleForm.hidden ? 'Thêm' : 'Ẩn';
});

function renderSchedules() {
  scheduleTableBody.innerHTML = '';
  scheduleTable.hidden = schedules.length === 0;

  schedules.forEach((schedule, index) => {
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    dateCell.textContent = schedule.date;
    const scheduleCell = document.createElement('td');
    scheduleCell.textContent = schedule.content;
    const inspectionCell = document.createElement('td');
    inspectionCell.textContent = schedule.inspection;
    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Xóa';
    removeButton.addEventListener('click', () => {
      schedules.splice(index, 1);
      localStorage.setItem('workSchedules', JSON.stringify(schedules));
      renderSchedules();
    });
    actionCell.appendChild(removeButton);
    row.append(dateCell, scheduleCell, inspectionCell, actionCell);
    scheduleTableBody.appendChild(row);
  });
}

scheduleForm.addEventListener('submit', event => {
  event.preventDefault();
  schedules.push({
    date: scheduleDate.value.trim(),
    content: scheduleContent.value.trim(),
    inspection: inspectionContent.value.trim()
  });
  localStorage.setItem('workSchedules', JSON.stringify(schedules));
  scheduleForm.reset();
  renderSchedules();
  scheduleForm.hidden = true;
  showScheduleFormButton.textContent = 'Thêm';
});

renderSchedules();

const documentPreview = document.getElementById('document-preview');
const documentPreviewTitle = document.getElementById('document-preview-title');
const documentPreviewBody = document.getElementById('document-preview-body');
const closeDocumentPreview = document.getElementById('close-document-preview');

closeDocumentPreview.addEventListener('click', () => {
  documentPreview.hidden = true;
});

async function previewDocument(storedFile) {
  documentPreview.hidden = false;
  documentPreviewTitle.textContent = storedFile.fileName;
  documentPreviewBody.innerHTML = '';

  const fileName = storedFile.fileName.toLowerCase();
  if (fileName.endsWith('.pdf')) {
    const response = await fetch(storedFile.fileData);
    const fileBlob = await response.blob();
    const previewUrl = URL.createObjectURL(fileBlob);
    const frame = document.createElement('iframe');
    frame.src = previewUrl;
    frame.title = storedFile.fileName;
    frame.className = 'document-preview-frame';
    documentPreviewBody.appendChild(frame);
    return;
  }

  if (!fileName.endsWith('.docx')) {
    documentPreviewBody.textContent = 'Chỉ xem trước trực tiếp được file Word .docx và PDF. File .doc cần tải xuống để mở bằng Word.';
    return;
  }

  documentPreviewBody.textContent = 'Đang mở file...';
  try {
    const response = await fetch(storedFile.fileData);
    const fileBlob = await response.blob();
    const fileUrl = URL.createObjectURL(fileBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = storedFile.fileName;
    downloadLink.textContent = 'Tải file Word';
    documentPreviewBody.appendChild(downloadLink);
    const arrayBuffer = await fileBlob.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const wordPage = document.createElement('article');
    wordPage.className = 'word-document-page';
    wordPage.innerHTML = result.value || 'File không có nội dung để xem trước.';
    documentPreviewBody.appendChild(wordPage);
  } catch (error) {
    documentPreviewBody.textContent = 'Không thể xem trước file này. Bạn hãy tải file xuống để mở bằng Word.';
  }
}

// Quản lý file giáo án theo từng phần kế hoạch
document.querySelectorAll('.plan-upload-form').forEach(form => {
  const filesPerPage = 10;
  const planId = form.dataset.planId;
  const showFormButton = document.querySelector(`.show-plan-form[data-plan-id="${planId}"]`);
  const fileList = document.querySelector(`.plan-file-list[data-plan-id="${planId}"]`);
  const pagination = document.querySelector(`.plan-pagination[data-plan-id="${planId}"]`);
  const storedFiles = JSON.parse(localStorage.getItem(`planFiles-${planId}`) || '[]');
  let currentPage = 1;

  showFormButton.addEventListener('click', () => {
    form.hidden = !form.hidden;
    showFormButton.textContent = form.hidden ? 'Thêm' : 'Ẩn';
  });

  const renderPlanFiles = () => {
    const tableBody = fileList.querySelector('tbody');
    tableBody.innerHTML = '';
    fileList.hidden = storedFiles.length === 0;
    const totalPages = Math.ceil(storedFiles.length / filesPerPage);
    currentPage = Math.min(currentPage, Math.max(totalPages, 1));
    pagination.innerHTML = '';
    pagination.hidden = totalPages <= 1;

    if (totalPages > 1) {
      const previousButton = document.createElement('button');
      previousButton.type = 'button';
      previousButton.textContent = 'Trang trước';
      previousButton.disabled = currentPage === 1;
      previousButton.addEventListener('click', () => {
        currentPage -= 1;
        renderPlanFiles();
      });

      const pageLabel = document.createElement('span');
      pageLabel.textContent = `Trang ${currentPage} / ${totalPages}`;

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.textContent = 'Trang sau';
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener('click', () => {
        currentPage += 1;
        renderPlanFiles();
      });

      pagination.append(previousButton, pageLabel, nextButton);
    }

    const firstFileIndex = (currentPage - 1) * filesPerPage;
    storedFiles.slice(firstFileIndex, firstFileIndex + filesPerPage).forEach((storedFile, pageIndex) => {
      const item = document.createElement('tr');
      const uploaderCell = document.createElement('td');
      uploaderCell.textContent = storedFile.uploader;

      const fileCell = document.createElement('td');
      const fileLink = document.createElement('a');
      fileLink.href = storedFile.fileData;
      fileLink.download = storedFile.fileName;
      fileLink.textContent = storedFile.fileName;
      fileCell.appendChild(fileLink);

      const actionCell = document.createElement('td');
      const previewButton = document.createElement('button');
      previewButton.type = 'button';
      previewButton.textContent = 'Xem trước';
      previewButton.className = 'plan-preview-button';
      previewButton.addEventListener('click', () => previewDocument(storedFile));

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Xóa';
      removeButton.addEventListener('click', () => {
        storedFiles.splice(firstFileIndex + pageIndex, 1);
        localStorage.setItem(`planFiles-${planId}`, JSON.stringify(storedFiles));
        renderPlanFiles();
      });
      actionCell.append(previewButton, removeButton);

      item.appendChild(uploaderCell);
      item.appendChild(fileCell);
      item.appendChild(actionCell);
      tableBody.appendChild(item);
    });
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const uploader = form.elements.uploader.value.trim();
    const selectedFiles = Array.from(form.elements['lesson-plan'].files);
    const readFile = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve({
        uploader,
        fileName: file.name,
        fileData: reader.result
      }));
      reader.addEventListener('error', reject);
      reader.readAsDataURL(file);
    });

    Promise.all(selectedFiles.map(readFile)).then(uploadedFiles => {
      storedFiles.push(...uploadedFiles);

      try {
        localStorage.setItem(`planFiles-${planId}`, JSON.stringify(storedFiles));
        currentPage = Math.ceil(storedFiles.length / filesPerPage);
        form.reset();
        renderPlanFiles();
        form.hidden = true;
        showFormButton.textContent = 'Thêm';
      } catch (error) {
        storedFiles.splice(-uploadedFiles.length, uploadedFiles.length);
        alert('Không thể lưu giáo án. File có thể quá lớn, bạn hãy chọn ít file hơn hoặc file nhỏ hơn.');
      }
    }).catch(() => {
      alert('Không thể đọc một trong các file giáo án đã chọn.');
    });
  });

  renderPlanFiles();
});

// Quản lý kho nộp giáo án
const lessonFileForm = document.getElementById('lesson-file-form');
const lessonFilesInput = document.getElementById('lesson-files');
const lessonFileTable = document.getElementById('lesson-file-table');
const lessonFileTableBody = lessonFileTable.querySelector('tbody');
const lessonFilePagination = document.getElementById('lesson-file-pagination');
const showLessonFileFormButton = document.getElementById('show-lesson-file-form');
const lessonFiles = JSON.parse(localStorage.getItem('lessonFiles') || '[]');
const lessonFilesPerPage = 10;
let lessonCurrentPage = 1;

showLessonFileFormButton.addEventListener('click', () => {
  lessonFileForm.hidden = !lessonFileForm.hidden;
  showLessonFileFormButton.textContent = lessonFileForm.hidden ? 'Thêm' : 'Ẩn';
});

function renderLessonFiles() {
  lessonFileTableBody.innerHTML = '';
  lessonFileTable.hidden = lessonFiles.length === 0;
  const totalPages = Math.ceil(lessonFiles.length / lessonFilesPerPage);
  lessonCurrentPage = Math.min(lessonCurrentPage, Math.max(totalPages, 1));
  lessonFilePagination.innerHTML = '';
  lessonFilePagination.hidden = totalPages <= 1;

  if (totalPages > 1) {
    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.textContent = 'Trang trước';
    previousButton.disabled = lessonCurrentPage === 1;
    previousButton.addEventListener('click', () => {
      lessonCurrentPage -= 1;
      renderLessonFiles();
    });

    const pageLabel = document.createElement('span');
    pageLabel.textContent = `Trang ${lessonCurrentPage} / ${totalPages}`;

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = 'Trang sau';
    nextButton.disabled = lessonCurrentPage === totalPages;
    nextButton.addEventListener('click', () => {
      lessonCurrentPage += 1;
      renderLessonFiles();
    });
    lessonFilePagination.append(previousButton, pageLabel, nextButton);
  }

  const firstFileIndex = (lessonCurrentPage - 1) * lessonFilesPerPage;
  lessonFiles.slice(firstFileIndex, firstFileIndex + lessonFilesPerPage).forEach((lessonFile, pageIndex) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const fileLink = document.createElement('a');
    fileLink.href = lessonFile.fileData;
    fileLink.download = lessonFile.fileName;
    fileLink.textContent = lessonFile.fileName;
    nameCell.appendChild(fileLink);

    const dateCell = document.createElement('td');
    dateCell.textContent = lessonFile.sentDate;
    const previewCell = document.createElement('td');
    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.textContent = 'Xem trước';
    previewButton.className = 'lesson-preview-button';
    previewButton.addEventListener('click', () => previewDocument(lessonFile));
    previewCell.appendChild(previewButton);

    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Xóa';
    removeButton.addEventListener('click', () => {
      lessonFiles.splice(firstFileIndex + pageIndex, 1);
      localStorage.setItem('lessonFiles', JSON.stringify(lessonFiles));
      renderLessonFiles();
    });
    removeCell.appendChild(removeButton);
    row.append(nameCell, dateCell, previewCell, removeCell);
    lessonFileTableBody.appendChild(row);
  });
}

lessonFileForm.addEventListener('submit', event => {
  event.preventDefault();
  const selectedFiles = Array.from(lessonFilesInput.files);
  const sentDate = new Date().toLocaleDateString('vi-VN');
  const readFile = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve({
      fileName: file.name,
      sentDate,
      fileData: reader.result
    }));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

  Promise.all(selectedFiles.map(readFile)).then(uploadedFiles => {
    lessonFiles.push(...uploadedFiles);
    lessonCurrentPage = Math.ceil(lessonFiles.length / lessonFilesPerPage);
    try {
      localStorage.setItem('lessonFiles', JSON.stringify(lessonFiles));
      lessonFileForm.reset();
      renderLessonFiles();
      lessonFileForm.hidden = true;
      showLessonFileFormButton.textContent = 'Thêm';
    } catch (error) {
      lessonFiles.splice(-uploadedFiles.length, uploadedFiles.length);
      alert('Không thể lưu giáo án. File có thể quá lớn, bạn hãy chọn file nhỏ hơn.');
    }
  });
});

renderLessonFiles();

// Quản lý tài nguyên trong Kho học liệu số
document.querySelectorAll('.resource-upload-form').forEach(form => {
  const resourceId = form.dataset.resourceId;
  const showFormButton = document.querySelector(`.show-resource-form[data-resource-id="${resourceId}"]`);
  const fileTable = document.querySelector(`.resource-file-table[data-resource-id="${resourceId}"]`);
  const tableBody = fileTable.querySelector('tbody');
  const storedFiles = JSON.parse(localStorage.getItem(`resourceFiles-${resourceId}`) || '[]');

  showFormButton.addEventListener('click', () => {
    form.hidden = !form.hidden;
    showFormButton.textContent = form.hidden ? 'Thêm' : 'Ẩn';
  });

  function renderResourceFiles() {
    tableBody.innerHTML = '';
    fileTable.hidden = storedFiles.length === 0;

    storedFiles.forEach((storedFile, index) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const fileLink = document.createElement('a');
      fileLink.href = storedFile.fileData;
      fileLink.download = storedFile.fileName;
      fileLink.textContent = storedFile.fileName;
      nameCell.appendChild(fileLink);

      const dateCell = document.createElement('td');
      dateCell.textContent = storedFile.sentDate;

      const actionCell = document.createElement('td');
      const previewButton = document.createElement('button');
      previewButton.type = 'button';
      previewButton.textContent = 'Xem trước';
      previewButton.className = 'resource-preview-button';
      previewButton.addEventListener('click', () => previewDocument(storedFile));

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Xóa';
      removeButton.addEventListener('click', () => {
        storedFiles.splice(index, 1);
        localStorage.setItem(`resourceFiles-${resourceId}`, JSON.stringify(storedFiles));
        renderResourceFiles();
      });
      actionCell.append(previewButton, removeButton);
      row.append(nameCell, dateCell, actionCell);
      tableBody.appendChild(row);
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const selectedFiles = Array.from(form.elements['resource-files'].files);
    const sentDate = new Date().toLocaleDateString('vi-VN');
    const readFile = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve({
        fileName: file.name,
        sentDate,
        fileData: reader.result
      }));
      reader.addEventListener('error', reject);
      reader.readAsDataURL(file);
    });

    Promise.all(selectedFiles.map(readFile)).then(uploadedFiles => {
      storedFiles.push(...uploadedFiles);
      try {
        localStorage.setItem(`resourceFiles-${resourceId}`, JSON.stringify(storedFiles));
        form.reset();
        renderResourceFiles();
        form.hidden = true;
        showFormButton.textContent = 'Thêm';
      } catch (error) {
        storedFiles.splice(-uploadedFiles.length, uploadedFiles.length);
        alert('Không thể lưu tệp. Tổng dung lượng lưu trên trình duyệt đã đầy, bạn hãy chọn tệp nhỏ hơn.');
      }
    }).catch(() => {
      alert('Không thể đọc một trong các tệp đã chọn.');
    });
  });

  renderResourceFiles();
});

// Quản lý file trong phần Kiểm tra & đánh giá
document.querySelectorAll('.evaluation-upload-form').forEach(form => {
  const filesPerPage = 10;
  const evaluationId = form.dataset.evaluationId;
  const showFormButton = document.querySelector(`.show-evaluation-form[data-evaluation-id="${evaluationId}"]`);
  const fileTable = document.querySelector(`.evaluation-file-table[data-evaluation-id="${evaluationId}"]`);
  const pagination = document.querySelector(`.evaluation-pagination[data-evaluation-id="${evaluationId}"]`);
  const tableBody = fileTable.querySelector('tbody');
  const storedFiles = JSON.parse(localStorage.getItem(`evaluationFiles-${evaluationId}`) || '[]');
  let currentPage = 1;

  showFormButton.addEventListener('click', () => {
    form.hidden = !form.hidden;
    showFormButton.textContent = form.hidden ? 'Thêm' : 'Ẩn';
  });

  function renderEvaluationFiles() {
    tableBody.innerHTML = '';
    fileTable.hidden = storedFiles.length === 0;
    const totalPages = Math.ceil(storedFiles.length / filesPerPage);
    currentPage = Math.min(currentPage, Math.max(totalPages, 1));
    pagination.innerHTML = '';
    pagination.hidden = totalPages <= 1;

    if (totalPages > 1) {
      const previousButton = document.createElement('button');
      previousButton.type = 'button';
      previousButton.textContent = 'Trang trước';
      previousButton.disabled = currentPage === 1;
      previousButton.addEventListener('click', () => {
        currentPage -= 1;
        renderEvaluationFiles();
      });

      const pageLabel = document.createElement('span');
      pageLabel.textContent = `Trang ${currentPage} / ${totalPages}`;

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.textContent = 'Trang sau';
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener('click', () => {
        currentPage += 1;
        renderEvaluationFiles();
      });

      pagination.append(previousButton, pageLabel, nextButton);
    }

    const firstFileIndex = (currentPage - 1) * filesPerPage;
    storedFiles.slice(firstFileIndex, firstFileIndex + filesPerPage).forEach((storedFile, pageIndex) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const fileLink = document.createElement('a');
      fileLink.href = storedFile.fileData;
      fileLink.download = storedFile.fileName;
      fileLink.textContent = storedFile.fileName;
      nameCell.appendChild(fileLink);

      const dateCell = document.createElement('td');
      dateCell.textContent = storedFile.sentDate;

      const previewCell = document.createElement('td');
      const previewButton = document.createElement('button');
      previewButton.type = 'button';
      previewButton.textContent = 'Xem trước';
      previewButton.className = 'evaluation-preview-button';
      previewButton.addEventListener('click', () => previewDocument(storedFile));
      previewCell.appendChild(previewButton);

      const removeCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Xóa';
      removeButton.addEventListener('click', () => {
        storedFiles.splice(firstFileIndex + pageIndex, 1);
        localStorage.setItem(`evaluationFiles-${evaluationId}`, JSON.stringify(storedFiles));
        renderEvaluationFiles();
      });
      removeCell.appendChild(removeButton);
      row.append(nameCell, dateCell, previewCell, removeCell);
      tableBody.appendChild(row);
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const selectedFiles = Array.from(form.elements['evaluation-files'].files);
    const sentDate = new Date().toLocaleDateString('vi-VN');
    const readFile = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve({
        fileName: file.name,
        sentDate,
        fileData: reader.result
      }));
      reader.addEventListener('error', reject);
      reader.readAsDataURL(file);
    });

    Promise.all(selectedFiles.map(readFile)).then(uploadedFiles => {
      storedFiles.push(...uploadedFiles);
      try {
        localStorage.setItem(`evaluationFiles-${evaluationId}`, JSON.stringify(storedFiles));
        currentPage = Math.ceil(storedFiles.length / filesPerPage);
        form.reset();
        renderEvaluationFiles();
        form.hidden = true;
        showFormButton.textContent = 'Thêm';
      } catch (error) {
        storedFiles.splice(-uploadedFiles.length, uploadedFiles.length);
        alert('Không thể lưu tệp. File có thể quá lớn, bạn hãy chọn file nhỏ hơn.');
      }
    }).catch(() => {
      alert('Không thể đọc một trong các tệp đã chọn.');
    });
  });

  renderEvaluationFiles();
});

// Đồng bộ dữ liệu lên Supabase; localStorage chỉ còn là bộ nhớ đệm giao diện.
const cloudStorage = supabaseClient?.storage.from('documents');
const cloudKeys = [
  'teamMembers',
  'workSchedules',
  'quickNoticeFiles',
  'lessonFiles',
  ...document.querySelectorAll('.plan-upload-form').length ?
    Array.from(document.querySelectorAll('.plan-upload-form')).map(form => `planFiles-${form.dataset.planId}`) : [],
  ...document.querySelectorAll('.resource-upload-form').length ?
    Array.from(document.querySelectorAll('.resource-upload-form')).map(form => `resourceFiles-${form.dataset.resourceId}`) : [],
  ...document.querySelectorAll('.evaluation-upload-form').length ?
    Array.from(document.querySelectorAll('.evaluation-upload-form')).map(form => `evaluationFiles-${form.dataset.evaluationId}`) : []
];
let syncingCloud = false;
const originalSetItem = localStorage.setItem.bind(localStorage);

function dataUrlToBlob(dataUrl) {
  const [header, encodedData] = dataUrl.split(',');
  const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const binary = atob(encodedData);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

async function saveCloudFiles(section, files) {
  if (!supabaseClient || !cloudStorage) return;

  const { error: deleteError } = await supabaseClient
    .from('documents')
    .delete()
    .eq('section', section);
  if (deleteError) throw deleteError;

  const rows = [];
  for (const [index, file] of files.entries()) {
    const path = `${section}/${Date.now()}-${index}-${file.fileName}`;
    let fileUrl = file.fileData;
    if (file.fileData?.startsWith('data:')) {
      const { error: uploadError } = await cloudStorage.upload(path, dataUrlToBlob(file.fileData), {
        upsert: true,
        contentType: dataUrlToBlob(file.fileData).type
      });
      if (uploadError) throw uploadError;
      fileUrl = cloudStorage.getPublicUrl(path).data.publicUrl;
    }

    rows.push({
      section,
      file_name: file.fileName,
      file_url: fileUrl,
      sender_name: file.uploader || '',
      sent_date: file.sentDate || new Date().toISOString()
    });
  }

  if (rows.length) {
    const { error } = await supabaseClient.from('documents').insert(rows);
    if (error) throw error;
  }
}

async function syncKeyToCloud(key) {
  if (!supabaseClient || syncingCloud) return;
  const values = JSON.parse(localStorage.getItem(key) || '[]');

  if (key === 'teamMembers') {
    await supabaseClient.from('team_members').delete().neq('id', 0);
    const rows = values.map(member => ({
      name: member.name,
      role: member.role || null,
      file_name: member.fileName || null,
      file_url: member.fileData || null
    }));
    if (rows.length) await supabaseClient.from('team_members').insert(rows);
  } else if (key === 'workSchedules') {
    await supabaseClient.from('schedules').delete().neq('id', 0);
    const rows = values.map(schedule => ({
      schedule_date: schedule.date,
      schedule_content: schedule.content,
      inspection_content: schedule.inspection
    }));
    if (rows.length) await supabaseClient.from('schedules').insert(rows);
  } else {
    const section = key.replace(/^planFiles-/, 'plan:').replace(/^resourceFiles-/, 'resource:').replace(/^evaluationFiles-/, 'evaluation:').replace('quickNoticeFiles', 'quick-notice').replace('lessonFiles', 'lesson-files');
    await saveCloudFiles(section, values);
  }
}

localStorage.setItem = (key, value) => {
  originalSetItem(key, value);
  if (cloudKeys.includes(key)) {
    syncKeyToCloud(key).catch(error => console.error('Supabase sync failed:', error));
  }
};

async function loadCloudData() {
  if (!supabaseClient) return;
  syncingCloud = true;
  try {
    const { data: memberRows } = await supabaseClient.from('team_members').select('*').order('id');
    const { data: scheduleRows } = await supabaseClient.from('schedules').select('*').order('id');
    const { data: documentRows } = await supabaseClient.from('documents').select('*').order('id');

    const hasCloudData = (memberRows?.length || 0) + (scheduleRows?.length || 0) + (documentRows?.length || 0) > 0;
    const hasLocalData = cloudKeys.some(key => {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]').length > 0;
      } catch (error) {
        return false;
      }
    });

    if (!hasCloudData && hasLocalData) {
      syncingCloud = false;
      await Promise.all(cloudKeys.map(key => syncKeyToCloud(key)));
      return;
    }

    const members = (memberRows || []).map(member => ({
      name: member.name,
      role: member.role || '',
      fileName: member.file_name || '',
      fileData: member.file_url || ''
    }));
    const schedules = (scheduleRows || []).map(schedule => ({
      date: schedule.schedule_date,
      content: schedule.schedule_content,
      inspection: schedule.inspection_content
    }));
    const groupedFiles = {};
    (documentRows || []).forEach(file => {
      const key = file.section === 'quick-notice' ? 'quickNoticeFiles' :
        file.section === 'lesson-files' ? 'lessonFiles' :
        file.section.startsWith('plan:') ? `planFiles-${file.section.slice(5)}` :
        file.section.startsWith('resource:') ? `resourceFiles-${file.section.slice(9)}` :
        `evaluationFiles-${file.section.slice(11)}`;
      groupedFiles[key] ||= [];
      groupedFiles[key].push({
        fileName: file.file_name,
        fileData: file.file_url,
        uploader: file.sender_name || '',
        sentDate: file.sent_date
      });
    });

    const cloudValues = { teamMembers: members, workSchedules: schedules, ...groupedFiles };
    let changed = false;
    Object.entries(cloudValues).forEach(([key, value]) => {
      const current = localStorage.getItem(key);
      const next = JSON.stringify(value);
      if (current !== next) {
        originalSetItem(key, next);
        changed = true;
      }
    });
    if (changed) location.reload();
  } catch (error) {
    console.error('Cannot load Supabase data:', error);
  } finally {
    syncingCloud = false;
  }
}

loadCloudData();