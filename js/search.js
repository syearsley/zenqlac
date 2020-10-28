/// <reference path="../lib/vue.js" />

Vue.filter('date', function(value) {
    return value.split("T")[0];
});

const app = new Vue({
    el: '#app',
    data: {
        query: 'sys.contentTypeId = book',
        mappedQuery: null,
        entries: null,
		error: null,
		token: null,
        hasError: false
    },
    mounted() {
        this.search();	
    },
    methods: {
	
        search: function () {
            
            this.reset();

            if (this.query === '') {
                return;
            }

            const url = 'https://preview-develop.cloud.contensis.com/api/search?zenQL=' + this.query;
            const options = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            };

            fetch(url, options)
                .then(response => {
                    if (!response.ok) {
                        throw response;
                    }
                    return response.json();
                })
                .then(json => {
                    this.mappedQuery = json.query;
                    this.entries = json.entries;
                    this.error = json.error;
                })
                .catch(err => {
                    err.text().then( errorMessage => {
                        this.error = errorMessage;
                    })
                })
                
        },
        reset: function() {
            this.error = null;
            this.entries = null;
            this.mappedQuery = null;
		},
        loadSuggestions: function(e) {
			this.token = getTokenAt(e.target.value, e.target.selectionStart);
		},
        loadSuggestionsOnFocus: function(e) {
			setTimeout(() => this.loadSuggestions(e), 1);
		},
        clearSuggestions: function() {
			//this.token = null;
		}
    },
    filters: {
        pretty: function (value) {
            
            const syntaxHighlight = function (json) {
                if (typeof json != 'string') {
                    json = JSON.stringify(json, undefined, 2);
                }
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                    let cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            };
            
            if (value) {
                return syntaxHighlight(JSON.stringify(value, null, 4));
            }
        }
    }
});
