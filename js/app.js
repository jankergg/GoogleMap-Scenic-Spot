// jQuery的 DOM reaay事件 触发KnockOut的初始化行为
$(function() {
    'use strict';
    // 单个列表项目的视图模型
    var itemViewModel = function(attr) {
        var self = this;
        attr = attr || {};
        Object.assign(self, attr);

        self.active = ko.observable(false);
        self.visible= ko.observable(true);

        // 列表地址点击事件
        self.onClick = function() {
            if (!google || !google.maps) return;
            // 触发google Map marker的点击事件
            self.active(!self.active());
            if (self.active()) {
                google.maps.event.trigger(self.marker, 'click')
            }else{
                google.maps.event.trigger(self.infowindow, 'closeclick');
            }
        }

    }

    // 搜索列表的 ViewModel
    var searchViewModel = function(data) {
        var self = this;
        self.visible = ko.observable(true);

        self.closeBtnText = ko.computed(function(){
            return self.visible()?"x":"=";
        });

        self.toggleVisible = function(){
            self.visible(!self.visible());
        };

        // 搜索关键字
        self.key = ko.observable('');

        // 可观察数据，用来保存所有准备渲染到视图的地址信息
        // 性能优化：添加 rateLimit: 100ms 内频繁的数据更改不会触发dom更新
        self.locations = ko.observableArray(data.map(function(item){
            return new itemViewModel(item);
        })).extend({ rateLimit: 100 });

        // 是否正在查询
        self.searching = null;

        // 筛选符合所给关键字的地址
        self.onSearch = function() {
            if (!self.searching) {
                self.searching = setTimeout(function() {
                    self.__search();
                    self.searching = null;
                }, 300)
            }
        };

        // 缓存数组
        var __def = self.locations();
        // 延时搜索
        self.__search = function() {
            var key = $.trim(self.key()).toLowerCase();
            // 关键词为空则重置
            if (key === '') {
                return self.reset()
            }
            // 初始信息不存在，或者key无效，直接返回
            if (!__def.length || (key === self.key && key !== '')) return;
 
            // 筛选出匹配的结果
            self.locations( __def.map(function(item){
                // 匹配到名字，或者中文名字, 或者首字母
                item.visible(
                    item.name.toLowerCase().replace(/\s+/, '').indexOf(key) > -1 || 
                    item.cname.toLowerCase().indexOf(key) > -1 || 
                    item.capital.toLowerCase().indexOf(key) > -1
                );
                item.marker.setAnimation(google.maps.Animation.DROP),
                item.marker.setVisible(item.visible());
                return item;
            }));
        }

        // reset搜索结果
        self.reset = function() {
            self.locations(__def.map(function(item){
                item.visible(true);
                item.marker.setAnimation(null);
                item.marker.setVisible(true);
                return item;
            }));
        }
    }

    // 实例化viewModel,并传入地址数据
    var instanceViewModel = new searchViewModel(locationDatas);

    // Knockout 绑定视图和视图模型
    ko.applyBindings(
        instanceViewModel,
        // 绑定DOM
        document.getElementById('sidebar')
    );
    // 封装initMap方法，以便在Google Map加载完成之后进行初始化
    window.initMap = function() {
        if(typeof __initMap === 'function') {
            var extendedLocs = __initMap(instanceViewModel.locations);
            instanceViewModel.locations( extendedLocs )
        }
    }
})