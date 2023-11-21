/* global screenly */

document.addEventListener("DOMContentLoaded", function () {
  const productContainer = document.getElementById("product-list");

  // Function to fetch data from the API or retrieve from cache
  const fetchData = async () => {
    // Try to get the cached data from localStorage
    const cachedData = localStorage.getItem("cachedProductData");
   
    if (cachedData) {
      // If cached data is available, parse and use it
      return JSON.parse(cachedData);
    } else {
      // If no cached data, fetch data from the API
      try {

        const response = await fetch('http://localhost:3000/fetch-square-data');  //API Address
        const data = await response.json();

        // Cache the fetched data in localStorage
        localStorage.setItem("cachedProductData", JSON.stringify(data));

        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Handle the error as needed
      }
    }
  };

  // Call fetchData to get data, whether from cache or API
  fetchData()
    .then(data => {
      if (data && data.data) {
        const chunk_recieved = JSON.parse(data.data);
        if (chunk_recieved && chunk_recieved.objects.length > 0) {

          const obj = chunk_recieved.objects
         console.log(obj)

          // Object to store categories and their items
          const categorizedItems = {};

          // Iterate through the JSON data
          obj.forEach(entry => {
            if (entry.type === "CATEGORY") {
              // If the entry is a category, create a new array for it
              categorizedItems[entry.category_data.name] = {
                items: [],
              };
            } else if (entry.type === "ITEM") {
              // If the entry is an item, add it to the corresponding category array
              const categoryName = obj.find(category =>
                category.type === "CATEGORY" && category.id === entry.item_data.category_id
              );
              if (categoryName) {
                // Create an object representing the item with its amount
                const itemObject = {
                  name: entry.item_data.name,
                  amount: entry.item_data.variations[0].item_variation_data.price_money.amount, // Amount is a property of item_data
                };

                categorizedItems[categoryName.category_data.name].items.push(itemObject);
              }
            }
          });
          // Log the result
          console.log(categorizedItems);
          if (categorizedItems) {
            for (const category in categorizedItems) {
              //  main column
              const column = document.createElement("div");
              column.className = "columns";
              productContainer.appendChild(column);

              //  items for the current category
              const items = categorizedItems[category].items;

              // heading for the category
              const coffeeType = document.createElement("h2");
              const hr = document.createElement("hr");
              coffeeType.className = "coffeeType";
              coffeeType.textContent = category;
              column.appendChild(coffeeType);


              // Iterate through items and create elements
              for (const item of items) {
                const coffeeItem = document.createElement("div");
                coffeeItem.className = "coffeeItem";

                const itemName = document.createElement("span");
                itemName.className = "item-name"
                itemName.textContent = item.name;
                coffeeItem.appendChild(itemName);

                const itemAmount = document.createElement("span");
                itemAmount.className = "item-amount"
                itemAmount.textContent = `$${((item.amount)/100).toFixed(2)}`;
                coffeeItem.appendChild(itemAmount);

                // Append the coffeeItem to the main column
                column.appendChild(coffeeItem);
              }
            }
          }
      } else {
        productContainer.textContent = "No products available.";
      }
  }
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
