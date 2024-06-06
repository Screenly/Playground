document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search')
  const tableHead = document.querySelector('thead tr')
  const tableBody = document.querySelector('tbody')

  // Fetch and parse the CSV file
  fetch('https://tfl.gov.uk/bus-stops.csv')
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        complete: function (results) {
          console.log('CSV parsed successfully')
          console.log('Headers:', results.meta.fields) // Log headers
          console.log('First row:', results.data[0]) // Log first row of data

          // Identify column names
          const stopNameField = results.meta.fields.find(field => field.toLowerCase().includes('name'))
          const stopCodeField = results.meta.fields.find(field => field.toLowerCase().includes('code'))

          // Filter and map data
          const filteredData = results.data.map(row => {
            return {
              'Stop Name': stripSpecialCharacters(row[stopNameField] || ''),
              'Stop Code': row[stopCodeField] || ''
            }
          })

          console.log('Filtered Data:', filteredData) // Log filtered data
          renderTable(filteredData)
          addSearchFunctionality(filteredData)
        },
        error: function (error) {
          console.error('Error parsing CSV:', error)
        }
      })
    })
    .catch(error => {
      console.error('Error fetching CSV:', error)
    })

  function renderTable (data) {
    console.log('Rendering table')
    // Clear previous table content
    tableHead.innerHTML = ''
    tableBody.innerHTML = ''

    if (data.length > 0) {
      // Create table headers
      const headers = Object.keys(data[0])
      console.log('Headers:', headers) // Log headers
      headers.forEach(header => {
        const th = document.createElement('th')
        th.classList.add('px-4', 'py-2', 'bg-gray-300', 'font-semibold', 'text-left')
        th.textContent = toTitleCase(header.replace('_', ' '))
        tableHead.appendChild(th)
      })

      // Create table rows
      data.forEach(row => {
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

  function addSearchFunctionality (data) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase()
      const filteredData = data.filter(row =>
        Object.values(row).some(value => value.toLowerCase().includes(query))
      )
      renderTable(filteredData)
    })
  }

  function stripSpecialCharacters (str) {
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
  }

  function toTitleCase (str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
})
