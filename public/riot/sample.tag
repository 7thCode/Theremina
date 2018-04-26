<sample>
        <h3>{ message }</h3>
        <ul>
                <li each={ techs }>{ name }</li>
        </ul>

        <script>
                this.techs = [];
                var self = this;
                this.message = 'Hello, Riot!';
                fetch("./test.json").then(function(response) {
                        return response.json();
                }).then(function(json) {
                        self.techs = json;
                        self.update();
                });
        </script>

        <style>
                :scope { font-size: 2rem }
                h3 { color: #789 }
                ul { color: #999 }
        </style>
</sample>
