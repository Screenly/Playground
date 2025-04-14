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

  // Create filter container
  const filterContainer = document.createElement('div')
  filterContainer.id = 'filters'
  filterContainer.className = 'mb-4 flex flex-wrap gap-2'

  // Insert the filter container before the table
  const tableContainer = document.querySelector('.overflow-x-auto')
  tableContainer.parentNode.insertBefore(filterContainer, tableContainer)

  // Pagination settings
  const itemsPerPage = 100
  let currentPage = 1
  let filteredData = []
  let fullData = []
  let activeFilters = {}

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
            fullData = results.data
              .filter(row => row[stopNameField] && row[stopCodeField]) // Only keep rows with valid data
              .map(row => {
                return {
                  'Stop Name': stripSpecialCharacters(row[stopNameField] || ''),
                  'Stop Code': row[stopCodeField] || ''
                }
              })

            // Initialize filtered data with full data
            filteredData = [...fullData]

            // Hide loading indicator
            loadingIndicator.style.display = 'none'

            // Create filters
            createFilters()

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

  function createFilters() {
    // Clear any existing filters
    filterContainer.innerHTML = ''

    // Create alphabet filter
    const alphabetFilter = document.createElement('div')
    alphabetFilter.className = 'bg-white p-3 rounded shadow flex-grow'

    const alphabetLabel = document.createElement('div')
    alphabetLabel.className = 'text-sm font-semibold mb-2'
    alphabetLabel.textContent = 'Filter by first letter:'
    alphabetFilter.appendChild(alphabetLabel)

    const letterContainer = document.createElement('div')
    letterContainer.className = 'flex flex-wrap gap-1'
    alphabetFilter.appendChild(letterContainer)

    // Add "All" option
    const allButton = createLetterButton('All')
    allButton.classList.add('bg-blue-500', 'text-white')
    letterContainer.appendChild(allButton)

    // Add letter buttons A-Z
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i)
      letterContainer.appendChild(createLetterButton(letter))
    }

    filterContainer.appendChild(alphabetFilter)

    // Create area filter (based on common prefixes)
    const areaFilter = document.createElement('div')
    areaFilter.className = 'bg-white p-3 rounded shadow flex-grow'

    const areaLabel = document.createElement('div')
    areaLabel.className = 'text-sm font-semibold mb-2'
    areaLabel.textContent = 'Filter by common patterns:'
    areaFilter.appendChild(areaLabel)

    const areaSelect = document.createElement('select')
    areaSelect.className = 'w-full p-2 border rounded'
    areaSelect.id = 'area-filter'

    // Add default option
    const defaultOption = document.createElement('option')
    defaultOption.value = ''
    defaultOption.textContent = 'All areas'
    areaSelect.appendChild(defaultOption)

    // Find common patterns in stop names
    const patterns = detectCommonPatterns()
    patterns.forEach(pattern => {
      const option = document.createElement('option')
      option.value = pattern
      option.textContent = pattern
      areaSelect.appendChild(option)
    })

    areaSelect.addEventListener('change', function() {
      if (this.value) {
        activeFilters.pattern = this.value
      } else {
        delete activeFilters.pattern
      }
      applyFilters()
    })

    areaFilter.appendChild(areaSelect)
    filterContainer.appendChild(areaFilter)
  }

  function createLetterButton(letter) {
    const btn = document.createElement('button')
    btn.textContent = letter
    btn.className = 'px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300 transition-colors'
    btn.addEventListener('click', function() {
      // Remove active class from all letter buttons
      document.querySelectorAll('#filters button').forEach(b => {
        b.classList.remove('bg-blue-500', 'text-white')
        b.classList.add('bg-gray-200')
      })

      // Add active class to this button
      this.classList.remove('bg-gray-200')
      this.classList.add('bg-blue-500', 'text-white')

      if (letter === 'All') {
        delete activeFilters.letter
      } else {
        activeFilters.letter = letter
      }

      applyFilters()
    })
    return btn
  }

  function detectCommonPatterns() {
    // Extract common words from stop names
    const words = fullData
      .flatMap(item => item['Stop Name'].split(' '))
      .filter(word => word.length > 3) // Filter out short words

    // Count occurrences
    const wordCounts = {}
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })

    // Find common words (appearing more than 10 times)
    return Object.entries(wordCounts)
      .filter(([word, count]) => count > 10)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 15) // Take top 15
      .map(([word]) => word)
  }

  function applyFilters() {
    // Start with the full dataset
    let results = [...fullData]

    // Apply search query if present
    const searchQuery = searchInput.value.toLowerCase()
    if (searchQuery && searchQuery.length >= 2) {
      results = results.filter(row =>
        Object.values(row).some(value => value.toLowerCase().includes(searchQuery))
      )
    }

    // Apply letter filter if active
    if (activeFilters.letter) {
      results = results.filter(row =>
        row['Stop Name'].charAt(0).toUpperCase() === activeFilters.letter
      )
    }

    // Apply pattern filter if active
    if (activeFilters.pattern) {
      results = results.filter(row =>
        row['Stop Name'].includes(activeFilters.pattern)
      )
    }

    // Update filtered data
    filteredData = results

    // Reset to first page and update display
    currentPage = 1
    renderPagination()
    renderTablePage(currentPage)
  }

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
    } else {
      // No results message
      tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-gray-500">No bus stops match your criteria</td></tr>`
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    paginationContainer.innerHTML = ''

    if (totalPages <= 1 && filteredData.length === 0) {
      return
    }

    // Add total count
    const countInfo = document.createElement('div')
    countInfo.className = 'text-sm text-gray-600 mb-2 text-center w-full'
    countInfo.textContent = `Showing ${filteredData.length} of ${fullData.length} bus stops`
    paginationContainer.appendChild(countInfo)

    if (totalPages <= 1) {
      return
    }

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
      applyFilters()
    })
  }

  function stripSpecialCharacters(str) {
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
  }

  function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
})
