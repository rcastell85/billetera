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
		this.porcentaje = -1;
	};

	Egreso.prototype.calcularPorcentaje = function(total){

		if (total > 0) {
			this.porcentaje = Math.round((this.valor / total) * 100);
		} else {
			this.porcentaje = -1;
		}
	};

	Egreso.prototype.getPorcentaje = function(){
		return this.porcentaje;
	}

	var calcularTotal = function(type){
		var sum = 0;

		data.allItems[type].forEach(function (current){
			sum += current.valor;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		billetera:0,
		porcentaje: 0
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

		deleteItem: function(type, id){

			var ids, index;

			ids = data.allItems[type].map(function(current){
					return current.id;
			});
			
			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);	
			}
			

		},

		calcularBilletera: function(){

			// Calcular total de ingresos y egresos por separado
			calcularTotal('exp');
			calcularTotal('inc');

			// calcular total general (ingresos - egresos)
			data.billetera = data.totals.inc - data.totals.exp;

			//calcular porcentajes
			if (data.totals.inc > 0 && data.totals.inc >= data.totals.exp) {
				data.porcentaje = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.porcentaje = -1;
			}
			

		},

		calcularPorcentajes: function(){
			var expenses = data.allItems.exp;

			expenses.forEach(function(current){
				current.calcularPorcentaje(data.totals.inc);
			});
		},

		getPorcentajes: function(){
			var allPorcentajes = data.allItems.exp.map(function(current){
				return current.getPorcentaje();
			});

			return allPorcentajes;
		},

		getBilletera: function(){
			return {
				billetera: data.billetera,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				porcentaje: data.porcentaje 
			}
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
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		porcentajeLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		fechaLabel: '.budget__title--month'
	};

	var formatoNumeros = function(num, type){

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};

	return {
		traerInput: function(){

			return{
				type: document.querySelector(DOMstrings.inputType).value,
				descripcion: document.querySelector(DOMstrings.inputDescription).value,
				valor: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		agregarItem: function(obj, type){
			var html, newHtml, element;

			// 1. creamos el html que se va a insertar con placeholders a reemplazar (%plaveholder%)
			if (type === 'inc') {

				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			} else if(type === 'exp') {

				element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} 

			// 2. Reemplazamos el placeholder con la data del objeto

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%descripcion%', obj.descripcion);
			newHtml = newHtml.replace('%valor%', formatoNumeros(obj.valor, type));

			// 3. Insertamos el html en el DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		limpiarCampos: function(){
			var campos, camposArr;

			campos = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			camposArr = Array.prototype.slice.call(campos); // transforma lista de nodos en array

			camposArr.forEach(function(current, index, array){
				current.value = "";
			})

			camposArr[0].focus();
		},	

		deleteListItem(id){

			var el = document.getElementById(id);
			el.parentNode.removeChild(el);
		},

		mostrarBilletera: function(obj){
			var type;

			obj.billetera > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatoNumeros(obj.billetera, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatoNumeros(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatoNumeros(obj.totalExp, 'exp');

			if (obj.porcentaje > 0) {
				document.querySelector(DOMstrings.porcentajeLabel).textContent = obj.porcentaje + '%';
			} else {
				document.querySelector(DOMstrings.porcentajeLabel).textContent = '---';
			}
			
		},

		mostrarPorcentajes: function(porcentajes){

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			var nodeListForEach = function(list, callback){
				for (var i = 0;	i < list.length; i++) {
						callback(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index){
				if (porcentajes[index] > 0){	
					current.textContent	= porcentajes[index] + '%';
				} else {
					current.textContent	= '---';
				}
			});
		},

		mostrarFecha: function(){
			var now, anio, mes, meses;

			now = new Date();

			meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

			mes = now.getMonth();
			anio = now.getFullYear();

			document.querySelector(DOMstrings.fechaLabel).textContent = meses[mes] + ' de ' + anio;
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

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	};

	var actualizarBilletera = function(){

		// 1. Calcular el total
		ctrlBill.calcularBilletera();

		// 2. Retornar el total
		var bill = ctrlBill.getBilletera();

		// 3. Mostrarlo en la UI 
		ctrlUI.mostrarBilletera(bill);
	};

	var actualizarPorcentajes = function(){

		// 1. Calcular los porcentajes
		ctrlBill.calcularPorcentajes();

		// 2. leer los porcentajes del contoller billetera 
		var porcentajes = ctrlBill.getPorcentajes();

		// 3. Actualizar la UI con los nuevos porcentajes
		ctrlUI.mostrarPorcentajes(porcentajes);
	};

	var ctrlAgregarItem = function(){
		var input, newItem;

		// 1. Capturar los datos del input.
		input = ctrlUI.traerInput();

		if (input.descripcion !== '' && !isNaN(input.valor) && input.valor > 0) {
			// 2. Guardar el item en el controlador billetera
			newItem = ctrlBill.agregarItem(input.type, input.descripcion, input.valor);

			// 3. mostrar el item en la interfaz(controlador UI)
			ctrlUI.agregarItem(newItem, input.type);

			// 4. Limpiar los inputs de entrada
			ctrlUI.limpiarCampos();

			// 5. Calcular y mostrar el total
			actualizarBilletera();

			// 6. calcular y mostrar los porcentajes
			actualizarPorcentajes();	
		}

	};

	var ctrlDeleteItem = function(event){
		var itemId, splitId, type, ID;

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {

			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);
			
			// 1. Eliminar el item de la data
			ctrlBill.deleteItem(type, ID);

			// 2. Eliminar el item de la UI
			ctrlUI.deleteListItem(itemId);

			// 3. Actualizar y mostrar los calculos
			actualizarBilletera();

		}
	};

	return {
		init: function(){
			ctrlUI.mostrarFecha();
			ctrlUI.mostrarBilletera({
				billetera: 0,
				totalInc: 0,
				totalExp: 0,
				porcentaje: -1 
			});
			setupEvenListeners();
		}
	};

})(controllerBilletera, controllerUI);

controllerGeneral.init();