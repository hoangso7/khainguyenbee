// KBee Manager - Main JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Mobile optimization
    initializeMobileOptimizations();
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[onclick*="confirm"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Bạn có chắc chắn muốn thực hiện hành động này?')) {
                e.preventDefault();
            }
        });
    });

    // QR Code modal functionality
    const qrImages = document.querySelectorAll('.qr-code');
    qrImages.forEach(img => {
        img.addEventListener('click', function() {
            showQRModal(this.src, this.alt);
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
});

function showQRModal(src, title) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('qrModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'qrModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Mã QR - ${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="qrModalImage" src="" class="img-fluid" style="max-width: 300px;">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-honey" onclick="downloadQR()">
                            <i class="fas fa-download me-1"></i>Tải xuống
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Set image source and show modal
    document.getElementById('qrModalImage').src = src;
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function downloadQR() {
    const img = document.getElementById('qrModalImage');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'qr-code.png';
    link.click();
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function showLoading(element) {
    element.innerHTML = '<span class="loading"></span> Đang xử lý...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Search functionality
function searchBeehives() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Export functions
function exportToCSV() {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    let csv = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => {
            return '"' + cell.textContent.replace(/"/g, '""') + '"';
        });
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'beehives.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}

// Mobile optimization functions
function initializeMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                }
            }
        });
        
        input.addEventListener('blur', function() {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            }
        });
    });
    
    // Touch-friendly table scrolling
    const tables = document.querySelectorAll('.table-responsive');
    tables.forEach(table => {
        let isScrolling = false;
        
        table.addEventListener('touchstart', function() {
            isScrolling = true;
        });
        
        table.addEventListener('touchend', function() {
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        });
        
        // Prevent body scroll when scrolling table
        table.addEventListener('touchmove', function(e) {
            if (isScrolling) {
                e.stopPropagation();
            }
        });
    });
    
    // Optimize QR code display for mobile
    const qrCodes = document.querySelectorAll('.qr-code');
    qrCodes.forEach(qr => {
        qr.addEventListener('touchstart', function(e) {
            e.preventDefault();
            showQRModal(this.src, this.alt);
        });
    });
    
    // Add swipe gestures for navigation (optional)
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Horizontal swipe detection
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - could go to next page
                console.log('Swipe left detected');
            } else {
                // Swipe right - could go to previous page
                console.log('Swipe right detected');
            }
        }
        
        startX = 0;
        startY = 0;
    });
}

// Responsive table functions
function toggleTableColumns() {
    const table = document.querySelector('table');
    if (!table) return;
    
    const isMobile = window.innerWidth <= 768;
    const columns = table.querySelectorAll('th, td');
    
    columns.forEach((col, index) => {
        // Hide less important columns on mobile
        if (isMobile && (index === 2 || index === 5)) { // Hide split date and QR code columns
            col.style.display = 'none';
        } else {
            col.style.display = '';
        }
    });
}

// Call on window resize
window.addEventListener('resize', function() {
    toggleTableColumns();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    toggleTableColumns();
});
