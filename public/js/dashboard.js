document.addEventListener('DOMContentLoaded', () => {
     // Navigation functionality
     document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', function() {
          // Remove active class from all nav items
          document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
          // Add active class to clicked item
          this.classList.add('active');
          
          // Hide all content sections
          document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
          });
          
          // Show the selected content section
          const sectionId = this.getAttribute('data-section') + '-section';
          document.getElementById(sectionId).classList.add('active');
  
          // Fetch data based on section
          if (this.getAttribute('data-section') === 'daily') {
            fetchCurrentRashifal();
          }
          else if (this.getAttribute('data-section') === 'monthly') {
            loadMonthlyRashifal();
          }
          else if (this.getAttribute('data-section') === 'koshdhatu') {
            fetchCurrentKoshDhatu();
          }
        });
      });
  
      // Function to fetch and display current rashifal data
      async function fetchCurrentRashifal() {
        try {
          const response = await fetch('/admin/dailyrashifalcurrent');
          const result = await response.json();
          
          const tableBody = document.getElementById('rashifalTableBody');
          if (result.status && result.data.length > 0) {
            tableBody.innerHTML = result.data.map(rashifal => `
              <tr>
                <td><span class="id-title">${rashifal.id}</span></td>
                <td><span class="hindi-title">${rashifal.title_hn}</span></td>
                <td><span class="english-title">${rashifal.title_en}</span></td>
                <td><span class="date-title">${rashifal.date_rashifal}</span></td>
                <td><span class="hindi-details">${rashifal.details_hn}</span></td>
                <td><span class="english-details">${rashifal.details_en}</span></td>
              </tr>
            `).join('');
          } else {
            tableBody.innerHTML = `
              <tr>
                <td colspan="6" class="no-data">No rashifal entries available</td>
              </tr>
            `;
          }
        } catch (error) {
          console.error('Error fetching rashifal:', error);
          document.getElementById('rashifalTableBody').innerHTML = `
            <tr>
              <td colspan="6" class="error-message">Error loading rashifal data</td>
            </tr>
          `;
        }
      }
  
      // Function to load monthly rashifal data
      async function loadMonthlyRashifal() {
        try {
          // Get current month (1-12)
          // const currentMonth = new Date().getMonth() + 1;
          // console.log('Loading data for current month:', currentMonth);
          
          // Fetch data for current month
          const response = await fetch(`/admin/upload`);
          const result = await response.json();
          
          const tableBody = document.getElementById('monthlyRashifalTableBody');
          if (result.status && result.data.length > 0) {
            tableBody.innerHTML = result.data.map(toInsert => `
              <tr>
                <td>${toInsert._id || '-'}</td>
                <td>${toInsert.title_hi || '-'}</td>
                <td>${toInsert.meaning || '-'}</td>
                <td>${toInsert.structure || '-'}</td>
                <td>${toInsert.image ? `<img src="${toInsert.image}" alt="Rashifal Image">` : '-'}</td>
                <td>
                  <input type="text" class="search-input" placeholder="Search...">
                </td>
              </tr>
            `).join('');
          } else {
            tableBody.innerHTML = `
              <tr>
                <td colspan="6" class="no-data-message">No rashifal data available for this month</td>
              </tr>
            `;
          }
        } catch (error) {
          console.error('Error loading monthly rashifal:', error);
          document.getElementById('monthlyRashifalTableBody').innerHTML = `
            <tr>
              <td colspan="6" class="no-data-message">Error loading rashifal data</td>
            </tr>
          `;
        }
      }
  
      // Function to fetch current KoshDhatu data with pagination
      async function fetchCurrentKoshDhatu(page = 1) {
        try {
          const response = await fetch(`/admin/koshdhatu/current?page=${page}`);
          const result = await response.json();
          
          const tableBody = document.getElementById('koshDhatuTableBody');
          const paginationContainer = document.getElementById('koshDhatuPagination');
          
          if (result.status && result.data && result.data.length > 0) {
            // Display entries
            tableBody.innerHTML = result.data.map(entry => `
              <tr class="koshdhatu-row" data-id="${entry._id}">
                <td>${entry.id || '-'}</td>
                <td>${entry.title_hn || '-'}</td>
                <td>${entry.title_en || '-'}</td>
                <td>${entry.title_sn || '-'}</td>
                <td>${entry.meaning || '-'}</td>
                <td>${entry.structure || '-'}</td>
                <td>${entry.search || '-'}</td>
                <td>${entry.image ? `<img src="${entry.image}" alt="KoshDhatu Image">` : '-'}</td>
                <td>${entry.vishesh || '-'}</td>
                <td>${entry.date_rashifal ? new Date(entry.date_rashifal).toLocaleDateString() : '-'}</td>
              </tr>
            `).join('');
            
            // Setup pagination
            if (result.pagination && result.pagination.totalPages > 1) {
              let paginationHTML = '';
              
              // Previous button
              paginationHTML += `
                <button class="pagination-btn" id="prevPage" ${page === 1 ? 'disabled' : ''}>
                  Previous
                </button>
              `;
              
              // Page numbers
              for (let i = 1; i <= result.pagination.totalPages; i++) {
                paginationHTML += `
                  <button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">
                    ${i}
                  </button>
                `;
              }
              
              // Next button
              paginationHTML += `
                <button class="pagination-btn" id="nextPage" ${page === result.pagination.totalPages ? 'disabled' : ''}>
                  Next
                </button>
              `;
              
              paginationContainer.innerHTML = paginationHTML;
              
              // Add event listeners to pagination buttons
              document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
                btn.addEventListener('click', () => {
                  const pageNum = parseInt(btn.getAttribute('data-page'));
                  fetchCurrentKoshDhatu(pageNum);
                });
              });
              
              // Previous page button
              document.getElementById('prevPage').addEventListener('click', () => {
                if (page > 1) {
                  fetchCurrentKoshDhatu(page - 1);
                }
              });
              
              // Next page button
              document.getElementById('nextPage').addEventListener('click', () => {
                if (page < result.pagination.totalPages) {
                  fetchCurrentKoshDhatu(page + 1);
                }
              });
            } else {
              paginationContainer.innerHTML = '';
            }
          } else {
            tableBody.innerHTML = `
              <tr>
                <td colspan="10" class="no-data">No KoshDhatu entries available</td>
              </tr>
            `;
            paginationContainer.innerHTML = '';
          }
        } catch (error) {
          console.error('Error fetching KoshDhatu:', error);
          tableBody.innerHTML = `
            <tr>
              <td colspan="10" class="error-message">Error loading KoshDhatu data</td>
            </tr>
          `;
          paginationContainer.innerHTML = '';
        }
      }
  
      document.getElementById('dailyUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('dailyFile');
        const messageDiv = document.getElementById('uploadMessage');
        
        if (!fileInput.files.length) {
          showMessage('Please select a file to upload', 'danger');
          return;
        }
  
        const formData = new FormData();
        formData.append('dailyFile', fileInput.files[0]);
  
        try {
          showMessage('Uploading file...', 'info');
          const response = await fetch('/admin/daily-upload', {
            method: 'POST',
            body: formData
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
          }
  
          const result = await response.json();
          
          if (result.status) {
            showMessage(
              `Success! Processed ${result.details.saved} entries.` + 
              (result.details.errors > 0 ? ` ${result.details.errors} errors occurred.` : ''),
              'success'
            );
            // Clear the file input after successful upload
            fileInput.value = '';
            // Refresh the rashifal list after successful upload
            fetchCurrentRashifal();
          } else {
            showMessage(result.message || 'Error uploading file', 'danger');
          }
        } catch (error) {
          console.error('Upload error:', error);
          showMessage('Error uploading file: ' + error.message, 'danger');
        }
      });
  
      function showMessage(message, type) {
        const messageDiv = document.getElementById('uploadMessage');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.style.display = 'block';
      }
  
      // Modal functions
      function openBulkUploadModal() {
        document.getElementById('bulkUploadModal').style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
  
      function closeBulkUploadModal() {
        document.getElementById('bulkUploadModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
      }
  
      // Close modal when clicking outside
      window.onclick = function(event) {
        const modal = document.getElementById('bulkUploadModal');
        if (event.target === modal) {
          closeBulkUploadModal();
        }
      }
  
      // Month Navigator functionality
      document.querySelectorAll('.month-item').forEach(item => {
        item.addEventListener('click', function() {
          // Remove active class from all month items
          document.querySelectorAll('.month-item').forEach(i => i.classList.remove('active'));
          // Add active class to clicked item
          this.classList.add('active');
          // Get the selected month
          const selectedMonth = this.getAttribute('data-month');
          console.log('Selected month:', selectedMonth);
          // You can add your month-specific logic here
        });
      });
  
      // Handle KoshDhatu upload
      document.getElementById('koshDhatuUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('koshDhatuFile');
        const messageDiv = document.getElementById('koshDhatuUploadMessage');
        
        if (!fileInput.files.length) {
          messageDiv.textContent = 'Please select a file to upload';
          messageDiv.className = 'alert alert-danger';
          messageDiv.style.display = 'block';
          return;
        }
  
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
  
        try {
          messageDiv.textContent = 'Uploading file...';
          messageDiv.className = 'alert alert-info';
          messageDiv.style.display = 'block';
          
          const response = await fetch('/admin/upload-koshdhatu', {
            method: 'POST',
            body: formData
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
          }
  
          const result = await response.json();
          
          if (result.status) {
            messageDiv.textContent = `Success! Processed ${result.data.saved} entries.` + 
              (result.data.errors > 0 ? ` ${result.data.errors} errors occurred.` : '');
            messageDiv.className = 'alert alert-success';
            messageDiv.style.display = 'block';
            
            // Clear the file input after successful upload
            fileInput.value = '';
            // Refresh the KoshDhatu list after successful upload
            fetchCurrentKoshDhatu();
            
            // Automatically switch to the KoshDhatu section
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            document.querySelector('.nav-links li[data-section="koshdhatu"]').classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
              section.classList.remove('active');
            });
            document.getElementById('koshdhatu-section').classList.add('active');
  
            // Keep success message visible for 5 seconds
            setTimeout(() => {
              messageDiv.style.display = 'none';
            }, 5000);
          } else {
            messageDiv.textContent = result.message || 'Error uploading file';
            messageDiv.className = 'alert alert-danger';
            messageDiv.style.display = 'block';
          }
        } catch (error) {
          console.error('Upload error:', error);
          messageDiv.textContent = 'Error uploading file: ' + error.message;
          messageDiv.className = 'alert alert-danger';
          messageDiv.style.display = 'block';
        }
      });
  
      // Add JS to show modal on row click
      document.addEventListener('click', async function(e) {
        const row = e.target.closest('.koshdhatu-row');
        if (row) {
          const id = row.getAttribute('data-id');
          // Fetch entry data from backend
          const res = await fetch(`/admin/koshdhatu/${id}`);
          const data = await res.json();
          if (data.status && data.entry) {
            const entry = data.entry;
            document.getElementById('viewKoshDhatuSeq').value = entry.id || '';
            document.getElementById('viewKoshDhatuTitleHn').value = entry.title_hn || '';
            document.getElementById('viewKoshDhatuTitleEn').value = entry.title_en || '';
            document.getElementById('viewKoshDhatuTitleSn').value = entry.title_sn || '';
            // Use CKEditor setData for meaning/structure
            if (meaningEditor) meaningEditor.setData(entry.meaning || '');
            if (structureEditor) structureEditor.setData(entry.structure || '');
            document.getElementById('viewKoshDhatuSearch').value = entry.search || '';
            document.getElementById('viewKoshDhatuVishesh').value = entry.vishesh || '';
            document.getElementById('viewKoshDhatuDate').value = entry.date_rashifal ? (new Date(entry.date_rashifal)).toLocaleDateString() : '';
            // Image
            if (entry.image) {
              document.getElementById('viewKoshDhatuImage').innerHTML = `<img src='${entry.image}' alt='Image' style='max-width:100px;'/>`;
            } else {
              document.getElementById('viewKoshDhatuImage').innerHTML = '-';
            }
            document.getElementById('viewKoshDhatuImageInput').value = entry.image || '';
            document.getElementById('koshDhatuViewModal').classList.add('active');
            document.querySelectorAll('.koshdhatu-row').forEach(r => r.classList.remove('koshdhatu-row-active'));
            row.classList.add('koshdhatu-row-active');
          }
        }
      });
  
      function closeKoshDhatuViewModal() {
        document.getElementById('koshDhatuViewModal').classList.remove('active');
        document.querySelectorAll('.koshdhatu-row').forEach(r => r.classList.remove('koshdhatu-row-active'));
      }
  
      // On image input change, update the preview
      document.getElementById('viewKoshDhatuImageInput').addEventListener('input', function() {
        const url = this.value;
        document.getElementById('viewKoshDhatuImage').innerHTML = url ? `<img src='${url}' alt='Image' style='max-width:100px;'/>` : '-';
      });
  
      // Add JS to handle Save (update)
      document.getElementById('viewKoshDhatuForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.querySelector('.koshdhatu-row.koshdhatu-row-active')?.getAttribute('data-id');
        if (!id) return;
        const payload = {
          id: document.getElementById('viewKoshDhatuSeq').value,
          title_hn: document.getElementById('viewKoshDhatuTitleHn').value,
          title_en: document.getElementById('viewKoshDhatuTitleEn').value,
          title_sn: document.getElementById('viewKoshDhatuTitleSn').value,
          // Use CKEditor getData for meaning/structure
          meaning: meaningEditor ? meaningEditor.getData() : '',
          structure: structureEditor ? structureEditor.getData() : '',
          search: document.getElementById('viewKoshDhatuSearch').value,
          image: document.getElementById('viewKoshDhatuImageInput').value,
          vishesh: document.getElementById('viewKoshDhatuVishesh').value,
          date_rashifal: document.getElementById('viewKoshDhatuDate').value
        };
        const msgDiv = document.getElementById('koshDhatuEditMessage');
        try {
          const res = await fetch(`/admin/koshdhatu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          if (result.status) {
            msgDiv.textContent = 'Updated successfully!';
            msgDiv.className = 'alert alert-success';
            msgDiv.style.display = 'block';
            fetchCurrentKoshDhatu();
            setTimeout(() => {
              closeKoshDhatuViewModal();
              msgDiv.style.display = 'none';
            }, 1200);
          } else {
            msgDiv.textContent = result.message || 'Update failed!';
            msgDiv.className = 'alert alert-danger';
            msgDiv.style.display = 'block';
          }
        } catch (err) {
          msgDiv.textContent = 'Error updating entry.';
          msgDiv.className = 'alert alert-danger';
          msgDiv.style.display = 'block';
        }
      });
  
      // Initialize CKEditor for meaning and structure fields
      let meaningEditor, structureEditor;
      function initCKEditors() {
        if (!meaningEditor) {
          ClassicEditor.create(document.getElementById('viewKoshDhatuMeaning'))
            .then(editor => { meaningEditor = editor; })
            .catch(error => { console.error(error); });
        }
        if (!structureEditor) {
          ClassicEditor.create(document.getElementById('viewKoshDhatuStructure'))
            .then(editor => { structureEditor = editor; })
            .catch(error => { console.error(error); });
        }
      }
      // Call initCKEditors on page load
      window.addEventListener('DOMContentLoaded', initCKEditors);
  
      // When opening the modal, set CKEditor data
      meaningEditor && meaningEditor.setData(entry.meaning || '');
      structureEditor && structureEditor.setData(entry.structure || '');
  });