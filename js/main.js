var bt = angular.module('BurgerTime', ['ngSanitize']);

bt.controller('MainCtrl', ['$scope','$http',function($scope,$http) {
	$scope.welcome = "It's Burger Time!";
	$scope.showmenu = false;
	$scope.order = [];
	$scope.menu = [];
	$scope.popular = [];
	$scope.showAll = false;


	$scope.setName = function(){
		if($scope.name&&$scope.name.length>2) {
			$scope.welcome = "It's Burger Time, "+$scope.name+"!";
		} else {
			$scope.welcome = "It's Burger Time!";
		}
	};

	$scope.getMenu = function(){
		$http.get('data/burger.php?what=menu')
		.success(function(data, status) {
			$scope.menu = data;
			$scope.getPopular();
		})
		.error(function(data, status) {
			console.log("Failed to get menu",data,status);	
		});
	};

	$scope.getPopular = function(){
		$http.get('data/burger.php?what=popular')
		.success(function(data, status) {
			$scope.popular = data;
			for(var i = 0; i < $scope.popular.length; i++) {
				var menuItemId = $scope.popular[i].burger_id, menuItemPos = i+1;
				$scope.menu[menuItemId].popularPosition = menuItemPos;
			}
		})
		.error(function(data, status) {
			console.log("Failed to get popular burgers",data,status);	
		});
	};

	$scope.getOrder = function(){
		$http.get('data/burger.php?what=orders')
		.success(function(data, status) {
			console.log("got order",data,status);
			$scope.order = data;
		})
		.error(function(data, status) {
			console.log("Failed to get order",data,status);	
		});
	};

	$scope.sendOrder = function(id){
		
		if(!$scope.name||$scope.name.length<3) {
			return alert("Please tell me your name!");
		}

		$http.get('data/burger.php?what=order&id='+id+'&name='+$scope.name)
		.success(function(data, status) {
			if(data==1) {
				$scope.getOrder();
			}
		})
		.error(function(data, status) {
			console.log("Failed to get menu",data,status);	
		});

	};

	$scope.cancelOrder = function(id){

		if(confirm("Are you sure you wish to cancel your order?")) {
			$http.get('data/burger.php?what=cancel&id='+id)
			.success(function(data, status) {
				if(data==1) {
					$scope.getOrder();
				}
			})
			.error(function(data, status) {
				console.log("Failed to get menu",data,status);	
			});
		}

	};

	$scope.getChips = function(){
		return Math.ceil($scope.order.length / 3);
	};

	$scope.toggleAll = function(){
		if($scope.showAll) {
			$scope.showAll = false;
		} else {
			$scope.showAll = true;
		}
	};

	$scope.getMenu();
	$scope.getOrder();

	setInterval(function(){
		$scope.getOrder();
	},5000);

}]);

bt.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});

bt.directive('burgers',['$filter',function($filter) {

	return {
		restrict: 'E',
		replace: true,
		scope: {
			menu: '=',
			send: '=',
			search: '='
		},
		template:'<ul class="list-group">'+
					'<li ng-repeat="item in calcedMenu | orderBy:[\'category\',\'name\']|filter:{description:search} " class="list-group-item">'+
					'{{item.name}} <span ng-show="item.popularPosition" class="popular position-{{item.popularPosition}}"><i class="fa fa-star"></i> Popular</span> <span ng-bind-html="item.category | category"></span><br/><small>{{item.description}}</small>'+
						'<div class="btn-group pull-right">'+
							'<button ng-repeat="option in item.options" ng-click="send(option.id)" type="button" class="btn btn-default">{{option.size}}</button>'+
						'</div>'+
					'</li>'+
					'</ul>',
		link: function($scope,$el,$attr) {
			

			$scope.$watch('menu',function(menu){

				$scope.calcedMenu = [];

				if(menu.length<1) {
					return;
				}

				for(var i = 0; i<menu.length; i++) {
					var newItem = menu[i],
						prevItem = findItem(newItem.name);
					
					if(prevItem<0) {
						newItem.options = [{
							id: newItem.id,
							size: newItem.size
						}];
						$scope.calcedMenu.push(newItem);
					} else {
						$scope.calcedMenu[prevItem].options.push({
							id: newItem.id,
							size: newItem.size
						});
					}
				}
			});

			var findItem = function(name){

				for(var i = 0; i<$scope.calcedMenu.length; i++) {
					if($scope.calcedMenu[i].name.toLowerCase()==name.toLowerCase()) {
						return i;
					}
				}

				return -1;
			};

		}
	};
}]);

bt.directive('orders',['$filter',function($filter) {

	return {
		restrict: 'E',
		replace: true,
		scope: {
			order: '=',
		},
		template:'<ul class="list-group">'+
					'<li ng-repeat="item in calcedOrder |orderBy:\'id\'" class="list-group-item">{{item.name}} <small>{{item.size}}"</small><small class="badge alert-info">{{item.number}}</small></li>'+
					'</li>'+
					'</ul>',
		link: function($scope,$el,$attr) {
			
			$scope.$watch('order',function(order){

				$scope.calcedOrder = [];

				if(order.length<1) {
					return;
				}

				for(var i = 0; i<order.length; i++) {

					var item = order[i],
						prevItem = findItem(item.burger_id);

					if(prevItem<0) {
						$scope.calcedOrder.push({
							id: item.burger_id,
							name: item.name,
							size: item.size,
							number: 1
						});
					} else {
						$scope.calcedOrder[prevItem].number++;
					}

				}

			});

			var findItem = function(id){

				for(var i = 0; i<$scope.calcedOrder.length; i++) {
					if($scope.calcedOrder[i].id==id) {
						return i;
					}
				}

				return -1;
			};

		}
	};
}]);

bt.filter('category', function() {
	return function(category) {
		switch (parseInt(category,10)) {
			case 1:
				return '<i class="fa fa-leaf"></i>';
				break;
		}
	};
});