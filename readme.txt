//используемые методы
.extend
.first
.data
.css
.find
.not
.addClass
.removeClass
.on
.off
.trigger
.closest
.is
.index
.attr



//ошибку img при max-width 100% можно исправив, установив
.njTabs-content div {
    width: 100%;
}
либо
.njTabs-content div img {
    width:100%
}


-можно инициализировать и вручную, и автобинд и через jquery
-если плагин уже инициализирован, его нельзя повторно инициализировать

-можно использовать jquery .show(number) для активации слайда
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
- если в show указать число меньшее нуля, будет использоваться индекс 0, если число больше кол-ва табов, используется индекс последнего таба
--в гайд
3 способа получения ссылки на instance





//anim function
// if(typeof o.anim === 'function') {
// 	o.anim.call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// } else if(typeof o.anim === 'string' && typeof njTabs.anim[o.anim] === 'function') {
// 	njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// } else {
// 	njTabs.anim[njTabs.defaults.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);
// }
// njTabs.anim[o.anim].call(this, $(this.v.contentEls[this.active]), tabContent, this.active, index);





























$.fn[pluginName] = function ( options ) {
    var args = arguments;

    // Is the first parameter an object (options), or was omitted,
    // instantiate a new instance of the plugin.
    if (options === undefined || typeof options === 'object') {
        return this.each(function () {

            // Only allow the plugin to be instantiated once,
            // so we check that the element has no plugin instantiation yet
            if (!$.data(this, 'plugin_' + pluginName)) {

                // if it has no instance, create a new one,
                // pass options to our plugin constructor,
                // and store the plugin instance
                // in the elements jQuery data object.
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });

    // If the first parameter is a string and it doesn't start
    // with an underscore or "contains" the `init`-function,
    // treat this as a call to a public method.
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

        // Cache the method call
        // to make it possible
        // to return a value
        var returns;

        this.each(function () {
            var instance = $.data(this, 'plugin_' + pluginName);

            // Tests that there's already a plugin-instance
            // and checks that the requested public method exists
            if (instance instanceof Plugin && typeof instance[options] === 'function') {

                // Call the method of our plugin instance,
                // and pass it the supplied arguments.
                returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
            }

            // Allow instances to be destroyed via the 'destroy' method
            if (options === 'destroy') {
              $.data(this, 'plugin_' + pluginName, null);
            }
        });

        // If the earlier cached method
        // gives a value back return the value,
        // otherwise return this to preserve chainability.
        return returns !== undefined ? returns : this;
    }
};