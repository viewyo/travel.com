/**
 * @name 	Slide切换控件jQuery版
 * @author  liu.wu10@zte.com.cn
 * @date 2014-08-15
 */
	// TODO Slider构造器
	function Slider() {
		this.init.apply(this,arguments);
	}
	Slider.prototype = {
		// 构造函数
		init: function(els,config) {
			// TODO 设置默认参数
			var self=this,
				config=config || {},
				k,defaults={
					autoPlay 	: true ,
					speed 	 	: 8000 ,
					eventName	: 'click',
					tabsClass   : 'point',
					conClass    : 'sliders',
					effect 	 	: 'hSlide',
					defaultTab	: 1,
					currClass   : 'current'
				};
			self.options={};
			for(k in defaults){
				// 检查自定义参数，若没有则使用默认参数
				self.options[k] = config[k] !== undefined ? config[k] : defaults[k];
			}

			self.root=$('#'+els);
			self.curr=defaults.defaultTab;
			// 初始化HTML并启动运行
			self.drawHTML();

			self.effectInit();
			// 绑定事件
			self.bindEvent();
			self.go(self.curr);
		},
		drawHTML:function(){
			var self=this,
				root=self.root;
			self.tabs=root.find('.'+self.options.tabsClass);
			self.tabcontent=root.find('.'+self.options.conClass);
			self.num=root.find('.num');
			self.sliderItems=self.tabcontent.children();
			self.len=self.sliderItems.length;
			if(self.num.length>0){
				self.num.find('.totalNum')[0].innerHTML=self.len;
			}
			// 如果选项卡没有指定内容，则自动创建内容
			if(self.tabs.find('li').length===0){
				var str='',ul=document.createElement('ul');
				for(var i=0;i<self.len;i++){
					var title = self.sliderItems[i].getAttribute('data-title') || "",
					prefix='';
					if(i===self.options.defaultTab){
						prefix=self.options.currClass;
					}
					str+='<li style="width:'+100/self.len+'%" class="'+prefix+'"><a>'+title+'</a></li>'
				}
				ul.innerHTML=str;
				self.tabs[0].appendChild(ul);
			}else{
				for(var j=0;j<self.len;j++){
					if(j===self.options.defaultTab){
						self.tabs.find('li')[j].className=self.options.currClass;
					}
				}
			}
			
			if(self.options.autoPlay && self.len>1){
				self.play();
			}
			return this;
		},
		// 绑定事件
		bindEvent:function(){
			var self=this;
			var li=self.tabs.find('li');
			var dir_nav	 = self.root.find('.dir_nav'),
				dir_prev = self.root.find('.dir_prev'),
				dir_next = self.root.find('.dir_next');
			if(self.len<=1 && dir_nav){
				dir_nav.hide();
			}
			for (var n = 0; n < self.len; n++) {
				(function(i) {
					$(li[n]).bind(self.options.eventName, function() {
						self.go(i);
						self.curr=i;
					})
				})(n)
			}
			
			self.root.bind('click',function(e){

				// 绑定上一个按钮
				if(e.target.className.indexOf('dir_prev')>-1){
					self.prev();
				}

				// 绑定下一个按钮
				if(e.target.className.indexOf('dir_next')>-1){
					self.next();
				}
			})

			self.root.bind('mouseover',function(e){
				if(self.timer!==null){
					clearTimeout(self.timer);
				}
				$(this).addClass('hover');
			})
			self.root.bind('mouseout',function(e){
				if(!self.options.autoPlay){
					return;
				}
				$(this).removeClass('hover');
				self.play();
			})
		},
		effectInit:function(){
			var self=this;

			var effectInitFn={
				'none':function(){
					if(!-[1, ]){
						self.sliderItems.hide();
						self.sliderItems[self.options.defaultTab].style.display='block';
					}
					$(self.sliderItems[self.options.defaultTab]).addClass('current');
				},
				'hSlide':function(){
					var cloneItem=self.sliderItems[0].cloneNode(true);
					self.tabcontent.append(cloneItem);
					self.tabcontent.css({'width': (self.len+1)*100+'%','position':'relative'});
					self.tabcontent.children().each(function() {
						this.style.width = 100/(self.len+1) + '%';
					})
				},
				'vSlide':function(){
					self.rootHeight=self.root.height();
					self.tabcontent.css({'position':'relative','height':self.rootHeight*self.len});
				},
				'fade':function(){
					if(!-[1, ]){
						self.tabcontent.css({'position':'relative'});
						self.sliderItems.each(function(index) {
							$(this).css({'position':'absolute','zIndex':0,'width':'100%'});
							if(index==self.options.defaultTab){
								$(this).css({
									'opacity': 1,
									'zIndex' : 1,
									'display': 'block'
								})
							}else{
								$(this).css({
									'opacity': 0,
									'zIndex' : 0,
									'display': 'none'
								})
							}
						})
					}else{
						self.tabcontent.css({'position':'relative'});
						self.sliderItems.css({'position':'absolute','width':'100%'});
						$(self.sliderItems[self.options.defaultTab]).addClass('current');
					}
				}
			}
			effectInitFn[self.options.effect]();
		},
		// 播放上一个
		prev:function(){
			var self=this;
			// 防止运行过快
			if(self.anim){
				return this;
			}
			self.curr--;
			if(self.curr<=0){
				self.curr=self.len;
			}
			self.go(self.curr);
			return this;
		},
		// 播放下一个
		next:function(){
			var self=this;
			// 防止运行过快
			if(self.anim){
				return this;
			}
			self.curr++;
			self.go(self.curr);
			if(self.curr>=self.len){
				self.curr=0;
			}
			
			return this;
		},
		//去往任意一个,0,1,2,3...
		"go":function(index){
			var self = this;
			self.anim=true;
			self.animFn(index).hightlightNav(index);
			// TODO 图片延时加载处理，第一张图片不能延时加载。
			if(index<=self.len-1){
				var textarea=$(self.sliderItems[index]).find('textarea');
				if(textarea.length>0){
					var html=textarea[0].value.replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');
					self.sliderItems[index].innerHTML=html;
					if(html.indexOf('<script>')>-1){
						var scriptText=html.substring(html.indexOf('<script>')+8,html.indexOf('</script>'));
						new Function(scriptText);
					}
				}
			}
			return this;
		},
		
		//高亮显示当前tab
		hightlightNav:function(index){
			var self=this,
				items=self.tabs.find('li');
			items.removeClass('current');
			if(index>=self.len){
				$(items[0]).addClass(self.options.currClass);
			}else{
				$(items[index]).addClass(self.options.currClass);
			}
			if(self.num.length>0){
				self.num.find('.currNum')[0].innerHTML=index;
			}
			return this;
		},
		// 独立出来的动画执行函数
		animFn:function(n){
			var self=this;

			var animEffect={
				'none':function(){
					self.sliderItems.each(function(){
						this.style.display='none';
					})
					self.sliderItems[n].style.display='block';
					self.anim=false;
				},
				'hSlide':function(){
					var pos = -n * 100 + '%';
					var items=self.tabcontent.children();
					items.removeClass('current');
					$(self.sliderItems[n]).addClass('current');
					self.tabcontent.animate({
						'left': pos
					},function(){
						self.anim=false;
						if(self.curr==0){
							$(items[0]).addClass('current');
							self.tabcontent[0].style.left='0%';
						}
					});
				},
				'vSlide':function(){
					var pos=-n*self.rootHeight+'px';
					self.tabcontent.animate({
						'top':pos
					},function(){
						self.anim=false;
					})
				},
				'fade':function(){
					if(!-[1, ]){
						self.sliderItems.css({'zIndex':0,'display':'none','opacity':0});
						$(self.sliderItems[n]).css({'zIndex':1,'display':'block'});
						$(self.sliderItems[n]).animate({
							'opacity':1
						},function(){
							self.anim=false;
						})
					}
					self.sliderItems.removeClass('current');
					$(self.sliderItems[n]).addClass('current');
					if(self.curr>=self.len){
						$(self.sliderItems[0]).addClass('current');
						if(!-[1,]){
							$(self.sliderItems[0]).css({'zIndex':1,'display':'block'});
							$(self.sliderItems[0]).animate({
								'opacity':1
							},function(){
								self.anim=false;
							})
						}
						self.curr=0;
					}
					self.anim=false;
				}
			}
			animEffect[self.options.effect]();
			return this;
		},
		play: function() {
			var self=this;
			if(self.timer!==null){
				clearTimeout(self.timer);
			}
			self.timer=setTimeout(function(){
				self.next().play();
			},Number(self.options.speed));
			return this;
		}
	}

