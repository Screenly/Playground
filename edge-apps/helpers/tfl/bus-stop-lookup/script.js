/* global Papa */

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search')
  const tableHead = document.querySelector('thead tr')
  const tableBody = document.querySelector('tbody')
  const loadingIndicator = document.createElement('div')
  loadingIndicator.id = 'loading'
  loadingIndicator.className = 'text-center p-4'
  loadingIndicator.innerHTML = '<p class="text-xl">Loading bus stop data...</p><div class="loader mt-2"></div>'
  document.querySelector('.container').appendChild(loadingIndicator)

  const paginationContainer = document.createElement('div')
  paginationContainer.id = 'pagination'
  paginationContainer.className = 'flex justify-center mt-4'
  document.querySelector('.container').appendChild(paginationContainer)

  // Pagination settings
  const itemsPerPage = 100
  let currentPage = 1
  let filteredData = []

  // Fetch and parse the CSV file
  fetch('https://tfl.gov.uk/bus-stops.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.text()
    })
    .then(csvText => {
      loadingIndicator.innerHTML = '<p class="text-xl">Processing data...</p><div class="loader mt-2"></div>'

      // Use a timeout to prevent UI blocking during parsing
      setTimeout(() => {
      Papa.parse(csvText, {
        header: true,
          skipEmptyLines: true,
          worker: true, // Use a worker thread for parsing
        complete: function (results) {
          console.log('CSV parsed successfully')

          // Identify the stop name column dynamically and use Naptan_Atco for the stop code
          const stopNameField = results.meta.fields.find(field => field.toLowerCase().includes('name'))
          const stopCodeField = 'Naptan_Atco'

          // Filter and map data
            filteredData = results.data
              .filter(row => row[stopNameField] && row[stopCodeField]) // Only keep rows with valid data
              .map(row => {
            return {
              'Stop Name': stripSpecialCharacters(row[stopNameField] || ''),
              'Stop Code': row[stopCodeField] || ''
            }
          })

            // Hide loading indicator
            loadingIndicator.style.display = 'none'

            renderPagination()
            renderTablePage(currentPage)
            addSearchFunctionality()
        },
        error: function (error) {
          console.error('Error parsing CSV:', error)
            loadingIndicator.innerHTML = '<p class="text-xl text-red-600">Error loading data. Please try again later.</p>'
        }
      })
      }, 100) // Small delay to allow UI to update
    })
    .catch(error => {
      console.error('Error fetching CSV:', error)
      loadingIndicator.innerHTML = '<p class="text-xl text-red-600">Error loading data. Please try again later.</p>'
    })

  function renderTablePage(page) {
    // Clear previous table content
    tableHead.innerHTML = ''
    tableBody.innerHTML = ''

    if (filteredData.length > 0) {
      // Create table headers
      const headers = Object.keys(filteredData[0])
      headers.forEach(header => {
        const th = document.createElement('th')
        th.classList.add('px-4', 'py-2', 'bg-gray-300', 'font-semibold', 'text-left')
        th.textContent = toTitleCase(header.replace('_', ' '))
        tableHead.appendChild(th)
      })

      // Calculate pagination
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length)
      const paginatedData = filteredData.slice(startIndex, endIndex)

      // Create table rows for current page
      paginatedData.forEach(row => {
        const tr = document.createElement('tr')
        headers.forEach(header => {
          const td = document.createElement('td')
          td.classList.add('border', 'px-4', 'py-2')
          td.textContent = row[header]
          tr.appendChild(td)
        })
        tableBody.appendChild(tr)
      })
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    paginationContainer.innerHTML = ''

    if (totalPages <= 1) {
      return
    }

    // Add total count
    const countInfo = document.createElement('div')
    countInfo.className = 'text-sm text-gray-600 mb-2 text-center w-full'
    countInfo.textContent = `Showing ${filteredData.length} bus stops`
    paginationContainer.appendChild(countInfo)

    // Create pagination controls
    const controls = document.createElement('div')
    controls.className = 'flex space-x-2'
    paginationContainer.appendChild(controls)

    // Previous button
    const prevButton = document.createElement('button')
    prevButton.textContent = 'Previous'
    prevButton.className = 'px-3 py-1 bg-gray-200 rounded'
    prevButton.disabled = currentPage === 1
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--
        renderTablePage(currentPage)
        renderPagination()
      }
    })
    controls.appendChild(prevButton)

    // Page numbers
    const pageNumbers = document.createElement('div')
    pageNumbers.className = 'flex space-x-1'
    controls.appendChild(pageNumbers)

    // Simplified pagination with current/total
    const pageInfo = document.createElement('span')
    pageInfo.className = 'px-3 py-1 bg-blue-500 text-white rounded'
    pageInfo.textContent = `${currentPage} / ${totalPages}`
    pageNumbers.appendChild(pageInfo)

    // Next button
    const nextButton = document.createElement('button')
    nextButton.textContent = 'Next'
    nextButton.className = 'px-3 py-1 bg-gray-200 rounded'
    nextButton.disabled = currentPage === totalPages
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++
        renderTablePage(currentPage)
        renderPagination()
      }
    })
    controls.appendChild(nextButton)
  }

  function addSearchFunctionality() {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase()
      if (query.length < 2) {
        // Only search when there are at least 2 characters
        filteredData = window.fullData || []
      } else {
        filteredData = (window.fullData || []).filter(row =>
        Object.values(row).some(value => value.toLowerCase().includes(query))
      )
      }

      currentPage = 1 // Reset to first page on new search
      renderPagination()
      renderTablePage(currentPage)
    })

    // Store full data for search filtering
    window.fullData = [...filteredData]
  }

  function stripSpecialCharacters(str) {
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
  }

  function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
})
