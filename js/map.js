(function(scope) {
    'use strict';
    // 实例化地图对象
    var map;

    // 实际上的地图初始化方法，接收一系列包含坐标的数据，完成marker 和 infowindow的初始化
    // 并返回加工以后的数组，传递给 viewModel 实例使用。
    var __initMap = function(Locations) {
        (typeof Locations === 'function') && (Locations = Locations());
        //接收有效的 包括地理位置的数组作为参数
        if (!Locations || !Locations.length) return;

        // 地图中心点
        var shanghai = {
            lat: 31.23071096,
            lng: 121.46484375
        };
        // 实例化地图对象
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: shanghai
        });

        // Google Map 经纬坐标获取方法（根据地址、名称等等）
        var geocoder = new google.maps.Geocoder();

        //初始化，向Locations成员对象添加 marker
        for (var i = 0; i < Locations.length; i++) {
            (function(item) {
                // 实例化 marker 并作为属性添加到Location对象
                item.marker = new google.maps.Marker({
                    title: item.cname,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: item.location
                });
                // 为 marker 绑定点击事件，弹出信息框
                item.marker.addListener('click', function() {
                    eventHandle.call(this, item);
                    item.marker.setAnimation(google.maps.Animation.BOUNCE);
                    item.active(true);
                });
            })(Locations[i])
        }
        return Locations
    };

    // 处理 marker 点击事件，并在第一次点击的时候从 wiki 获取相关信息
    var eventHandle = function(item) {
        if (item.wiki) {
            return item.infowindow.open(map, item.marker);
        }
        // 初始化信息框，用于marker点击时显示
        wikiQuery(item.name, function(data) {
            var _data = {};
            var _res = [];
            for (var e in data.query.pages) {
                var _page = data.query.pages[e];
                // 筛选出有效且的地址信息
                if (!/refer to:$/.test(_page.extract) && /shanghai/i.test(_page.extract)) {
                    _res.push(_page);
                }
            };

            if(!_res.length){
                alert('未查到相关地址信息！')
            }else{
                // 按相关性做排序
                _res.sort(function(a,b){
                    return a.index > b.index;
                });
                // 取条一条数据做展示 
                _data.text = _res[0].extract;
                _data.img = _res[0].thumbnail? '<img src="'+ _res[0].thumbnail.source.replace(/33px|50px/,'100px') +'" class="thumbnail" />':'';
            };

            // 创建 infowindow 实例 初始化，并创建关闭事件监听 
            item.infowindow = new google.maps.InfoWindow({
                content: _data.img +
                '<div class="infotext">'+_data.text +'--from[<a href="https://en.wikipedia.org/wiki/'+ item.name +'">wikipedia</a>]</div>'
            });
            // flag: wiki 是否已加载过
            item.wiki = _data;
            item.infowindow.open(map, item.marker);
            item.infowindow.addListener('closeclick',function(){
                item.infowindow.close();
                item.active(false);
                item.marker.setAnimation(null);
            });
        }, function(error) {
            alert('获取wiki词条失败');
            // 获取wiki失败，则默认使用 中文名字做 infowindow的内容展示
            item.infowindow = new google.maps.InfoWindow({
                content: item.cname
            });
            item.infowindow.open(map, item.marker);
        });
    };

    // wiki 查询方法 以及相关回调
    var wikiQuery = function(name, callback, onerror) {
        // wiki api
        var wikiApi = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch=';
        // jQuery 异步请求wiki 数据
        // 添加成功和失败状态下的回调处理
        $.ajax({
            url: wikiApi + name,
            dataType: 'json',
            success: function(data) {
                (typeof callback === 'function') && callback.call(this, data)
            },
            error: function(error) {
                (typeof onerror === 'function') && onerror.call(this, error)
            }
        });
    };

    // 创建script节点，用于加载 Google Map 脚本和api
    var script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDpC_a7Ej29OUsleNzki7tNSS8PmbpTiPI";
    script.onload = function() {
        // 加载成功则进行初始化
        (typeof scope.initMap === 'function') && scope.initMap()
    }
    script.onerror = function() {
        // 加载失败则报错
        alert('Google Map api加载失败，请检查您的网络');
    }
    document.body.appendChild(script);

    scope.__initMap = __initMap;
})(window);