//----------------------- CONTROLLER PARA EL BACK DE LA APLICACION --------------------------------//
var controllerBilletera = (function(){

	var Ingreso = function(id, descripcion, valor){
		this.id = id;
		this.descripcion = descripcion;
		this.valor = valor;
	};

	var Egreso = function(id, descripcion, valor){
		this.id = id;
		this.descripcion = descripcion;
		this.valor = valor;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		}
	};

	return {
		agregarItem: function(type, desc, val){
			var newItem, ID;

			// Creamos la asignacion de ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			//Crea un nuevo item(ingreso = inc y egreso = exp)
			if (type === 'inc') {
				newItem = new Ingreso(ID, desc, val)
			} else if(type === 'exp'){
				newItem = new Egreso(ID, desc, val)
			}

			//Agregar nuevo item
			data.allItems[type].push(newItem);
			return newItem;
		},

		testing: function(){
			console.log(data);
		}
	}

})();

//----------------------- CONTROLLER PARA LA UI DE LA APLICACION --------------------------------//

var controllerUI = (function (){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list'
	};

	return {
		traerInput: function(){

			return{
				type: document.querySelector(DOMstrings.inputType).value,
				descripcion: document.querySelector(DOMstrings.inputDescription).value,
				valor: document.querySelector(DOMstrings.inputValue).value
			}
		},

		agregarItem: function(obj, type){
			var html, newHtml, element;

			// 1. creamos el html que se va a insertar con placeholders a reemplazar (%plaveholder%)
			if (type === 'inc') {

				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			} else if(type === 'exp') {

				element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} 

			// 2. Reemplazamos el placeholder con la data del objeto

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%descripcion%', obj.descripcion);
			newHtml = newHtml.replace('%valor%', obj.valor);

			// 3. Insertamos el html en el DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		limpiarCampos: function(){
			var campos, camposArr;

			campos = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			camposArr = Array.prototype.slice.call(campos); // transforma lista de nodos en array

			camposArr.foreach(function(current, index, array){
				current.value = "";
			});

			camposArr[0].focus();
		},	

		getDOMstrings: function(){
			return DOMstrings;
		}
	};


})();

//------------------ CONTROLLER PARA LA INTERACCION ENTRE EL BACK Y LA UI DE LA APLICACION --------------------------------//

var controllerGeneral = (function(ctrlBill, ctrlUI){

	var setupEvenListeners = function(){

		var DOM = ctrlUI.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAgregarItem);

		document.addEventListener('keypress', function(e){
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAgregarItem();
			}
		});
	};

	var ctrlAgregarItem = function(){
		var input, newItem;

		// 1. Capturar los datos del input.
		input = ctrlUI.traerInput();

		// 2. Guardar el item en el controlador billetera
		newItem = ctrlBill.agregarItem(input.type, input.descripcion, input.valor);

		// 3. mostrar el item en la interfaz(controlador UI)
		ctrlUI.agregarItem(newItem, input.type);

		// 4. Limpiar los inputs de entrada
		ctrlUI.limpiarCampos();

		// 4. Calcular el total de la billetera en el controlador billetera

		// 5. Mostrar el total en la interfaz(controlador UI)

	};

	return {
		init: function(){
			return setupEvenListeners();
		}
	};

})(controllerBilletera, controllerUI);

controllerGeneral.init();