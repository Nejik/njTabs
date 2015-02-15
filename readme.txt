.extend
.data
.find
.addClass
.removeClass
.css
.delegate
.closest
.attr
.trigger



-потестить динамическое добавление табов
-сделать настройку not_trigger
-ивенты show, shown, hide, hidden
-можно инициализировать и вручную, и автобинд и через jquery
-можно использовать jquery .show(number) для активации слайда

//ошибку img при max-width 100% можно исправив, установив
.njTabs-content div {
	width: 100%;
}
либо
.njTabs-content div img {
	width:100%
}



-можно изменить default settings
-instance добавляется к dom element-у tabsWrapper
-no-tab
-название классов
-если многоуровневый список в табах,
	<ul class="njTabs"
		data-njt-content=".njTabs-content"
		data-njt-tab-selector=".njTabs > li"
		data-njt-trigger="a"
		data-njt-anim="slideOut"
		
	>
		<li><a href="#!">tab <span>1</span></a></li>
		<li>
			<ol>
				<li>
					<a href="#!">2.1</a>
				</li>
				<li>
					<a href="#!" class="not-tab">2.2</a>
				</li>
			</ol>
			<!-- <a href="#!" class="not-tab">tab <span>2</span></a> -->
		</li>
		<li><a href="#!">tab <span>3</span></a></li>
	</ul>
	можно либо указать корректный таб селектор .njTabs > li, либо простоавить все ссылкам первого уровня клас .test

- если многоуровневое меню, можно использовать data-njt-tab-selector=".njTabs > li > a"
- активный таб можно узнать this.active, this.activeTab, this.activeContent;







//anim function
// if(typeof o.anim === 'function') {
// 	o.anim.call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// } else if(typeof o.anim === 'string' && typeof njTabs.anim[o.anim] === 'function') {
// 	njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// } else {
// 	njTabs.anim[njTabs.defaults.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// }
// njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);