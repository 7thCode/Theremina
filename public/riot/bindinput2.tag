<bindinput2>

        <h3>using 'this' objec</h3>

        <div>
        <input type='text' name='target' placeholder='type text' oninput="{ input }">
        </div>

        <p>text: { text }</p>

        <script type="typescript">
            this.text = opts.init;
            input(e) {
                this.text = e.target.value;
            }
        </script>

</bindinput2>