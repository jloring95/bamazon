var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,

	user: 'root',

	password: 'mysqlpwd',
	database: 'Bamazon'
});


function promptUserPurchase() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter the ID of the item you would like.',
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?',
			filter: Number
		}
	]).then(function(input) {

		var item = input.item_id;
		var quantity = input.quantity;

		var queryRes = 'SELECT * FROM products WHERE ?';

		connection.query(queryRes, {item_id: item}, function(err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('Enter an ID from the current inventory');
				displayInventory();

			} else {
				var productData = data[0];

				if (quantity <= productData.stock_quantity) {
					console.log('Placing order!');

					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log(`Thank you for your business! Your total is $${productData.price * quantity}\n\n`);

						connection.end();
					})
				} else {
					console.log('Not enough product in inventory, please modify your order!');

					displayInventory();
				}
			}
		})
	})
}

function displayInventory() {

	queryStr = 'SELECT * FROM products';

	connection.query(queryStr, function(err, data) {
		if (err) throw err;

        console.log(`\n\nExisting Inventory:\n\n`);
        
		for (var i = 0; i < data.length; i++) {
			console.log(`\n Item ID: ${data[i].item_id}  Product Name: ${data[i].product_name}  Department: ${data[i].department_name}  Price: $${data[i].price}`);
        }
        console.log(`\n`);
	  	promptUserPurchase();
	})
}

function runBamazon() {
	displayInventory();
}

runBamazon();