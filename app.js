// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (currentElement) {
            sum += currentElement.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // last element in array (length - 1) + 1 (to add one on top)
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }

            // Push item to data structure
            data.allItems[type].push(newItem);

            // Return item
            return newItem;
        },

        deleteItem: function (type, id) {
            /* We can't just pass the ID of item to the array because 
            that will just use it to locate the element at that position in the array.
            Well, we can dig deeper but what we will do below is to return all the IDs 
            for the elements and then use that to identify the correct element.
            We can go the standard foreach way, it's just about seeing a new technique.
            
            id = 6
            data.allItems[type][id]; <--- this won't work as it will return the item with that position and not that index
            // ids = [1 2 4 6 8]
            // index = 3
            */
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            var index = ids.indexOf(id);

            if (index !== -1) {
                // delete element
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate percentage of income that is spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // non-existant
            }
        },

        calculatePercentages: function () {
            /*
            a = 20
            b = 10
            income = 100
            a = 20/income => 20/100 => 20%
            b = 10/income => 10/100 => 10%
            */
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            })

        },

        /*
            Here in the calculatePercentages and getPercentages we can see the difference between an array's forEach and map functions:
            forEach doesn't return anything whereas map does return so it is great if we want to return the values of all elements for example.
        */

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage(); // this will get called numberOfElementsInArray times
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        returnDataTesting: function () {
            console.log(data);
        }
    };
})();


// UI CONTROLLER
var UIController = (function () {

    // It's a better practice to keep all these strings in one place in case of having to change them later in the html
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputAddButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        budgetIncome: ".budget__income--value",
        budgetExpenses: ".budget__expenses--value",
        budgetPercentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentage: ".item__percentage",
        dateLabel: ".budget__title--month"

    }

    var formatNumber = function (num, type) {
        /*
            +/- before number
            2 decimal points
            , for thousands - up to 100,000
        */

        num = Math.abs(num);
        num = num.toFixed(2); // using a method on a basic type forces JS to wrap an object around

        var numSplit = num.split('.');
        var intNum = numSplit[0];
        var decNum = numSplit[1];

        if (intNum.length > 3) {
            intNum = intNum.substr(0, intNum.length - 3) + ',' + intNum.substr(intNum.length - 3, 3);
        }

        var sign;
        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + intNum + '.' + decNum;
    };


    // This is better implementation than the other querySelectorAll method I believe
    // Create our own forEach for the nodeList
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        clearInputFields: function () {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // because querySelector returns a nodeList, but we want an array, we will use call to assign the list to the array so that we can use the array's slice() function (a function that is stored in its prototype). Alternatively I could have replaced all this code with 2 separate .querySelector calls but it's for the sake of learning...
            // recall what call,bind and apply do: they allow you to change the 'this' for a given function
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (currentElement) {
                currentElement.value = "";
            });

            fieldsArray[0].focus();
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            /* This code is strange - we get child to get to parent to get to child, but JavaScript does not allow the removal of children directly!
            */
            var child = document.getElementById(selectorID);
            child.parentNode.removeChild(child);
        },

        displayBudget: function (obj) {
            var type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.budgetExpenses).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (current) {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputAddButton).classList.toggle("red");
        },

        displayMonth: function () {
            var now = new Date();
            var month = now.toLocaleString('default', { month: 'long' });

            document.querySelector(DOMstrings.dateLabel).textContent = month;
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings(); // CAUTION: you could use UIController.getDOMstrings() and it will work and it is scary because it removes decoupling and can cause bugs... 

        document.querySelector(DOM.inputAddButton).addEventListener("click", ctrlAddItem);

        // this is global event so we add it to the global document, and not a specific element
        document.addEventListener("keypress", function (event) { // see how we pass a parameter to the anonymous function on this event
            const returnKey = 13; // there is reference online to see which keycode it is or just console.log(event) and see the keycode after pressing enter on any key. 

            if (event.keyCode === returnKey || event.which === returnKey) { // event.which is for some older browsers.
                ctrlAddItem();
            }
        });

        // Notice this is on 'change' not on 'click'...
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    var updateBudget = function () {
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return budget
        var budget = budgetCtrl.getBudget();

        // Display budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update UI
        UICtrl.displayPercentages(percentages);
    };

    // This function is where all the logic sort of takes place
    var ctrlAddItem = function () {
        var input, newItem;

        // Get field input data
        input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            console.log(newItem);

            // Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // Clear fields
            UICtrl.clearInputFields();

            // Calculate and update budget
            updateBudget();

            // Update percentages
            updatePercentages();
        }
        else {
            alert("You have not entered an invalid description or value!");
        }
    };

    var ctrlDeleteItem = function (event) {
        /* 
            Here is example of DOM traversal to achieve delegate:
            if we just use event.target and click X on an item - we hit
            the icon which is child of the button:
            <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i>
            </button>

            but if we do event.target.parentNode we are targeting the button.
            This way we can go up the tree and reach the container to delete its 
            whole selction with children.
        */
        // This is not very clean of a solution because we are hardcoding the DOM structure.
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) // this will be coerced to true if it exists and false if it doesn't 
        {
            var splitID = itemID.split('-');
            var type = splitID[0];
            var ID = parseInt(splitID[1]);
            console.log(splitID);

            // Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete item from UI
            UICtrl.deleteListItem(itemID);

            // Update and show new budget
            updateBudget();

            // Update percentages
            updatePercentages();
        }
    }

    return {
        init: function () {
            console.log("Application is starting...");
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalIncome: 0,
                    totalExpenses: 0,
                    percentage: -1
                });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();