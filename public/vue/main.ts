
Vue.component('side-by-side', {
    template:
    '<div>' +
    '<header><slot name="header"></slot></header>' +
    '<div id="main">' +
    '<nav><slot name="nav"></slot></nav>' +
    '<article><slot name="article"></slot></article>' +
    '<aside><slot name="aside"></slot></aside>' +
    '</div>' +
    '<footer><slot name="footer"></slot></footer>' +
    '</div>'
});

new Vue({
    el: '#example'
});

Vue.component('my-input', {
    template: '<div class="form-group">' +
    "<label :class=\"errorClassObject('notnull')\">VALUE</label>" +
    '<input type="text" class="form-control" v-model="edit.value"></input>' +
    '</div>',
    data: function () {
        return {
            edit: {
                value: 'Init Value'
            }
        };
    },
    computed: {
        validation() {
            const edit = this.edit;
            return {
                notnull: edit.value != ""
            };
        },
        isValid() {
            const validation = this.validation;
            return Object
                .keys(validation)
                .every(function (key) {
                    return validation[key];
                });
        }
    },
    methods: {
        errorClassObject(key) {
            return {'null-error': (this.validation[key] == false)};
        },

    }

});

new Vue({
    el: '#field'
});

Vue.component('my-button', {
    template: '<button class="btn btn-info" v-on:click="counter += 1">{{ counter }}</button>',
    data: function () {
        return {counter: 1};
    }
});

new Vue({
    el: '#buttons',
    methods: {
        render: function (arg) {
            let elements:any[] = [];
            for (let index = 0; index < arg ; index++) {
                elements.push(this.$createElement('my-button', {}, [])); // <p>
            }
            let result = this.$createElement('div', {}, elements);
            return result;
        }
    }
});

new Vue({
    el: '.buttonlist',
    data: {
        counter: 0,
        list: ['Apple', 'Banana', 'Strawberry']
    },
    computed: {
        length: function() {
            return this.list.length
        }
    },
    methods: {
        addItem: function() {
            this.list.push('Orange' + (++this.counter).toString())
        }
    }
});



/*
new Vue({
    el: '#buttons',
    data:  {elements: []},
    render: function (createElement) {
        this.elements = [];
        for (let index = 0; index < this.count; index++) {
            this.elements.push(createElement('my-button', {}, []));
        }
        let result = createElement('div', {}, this.elements);
        return result;
    },
    methods: {
        addItem: function() {

            let a = 1;
  //          this.elements.push(createElement('my-button', {}, []));
        }
    },
    props: {
        count: {
            type: Number,
            required: true
        }
    }
});
*/





