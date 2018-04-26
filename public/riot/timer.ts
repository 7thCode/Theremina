@Riot.template(`timer.html`)

class Timer extends Riot.Element {
        time: number;
        timerHandle: number;

        mylist = ["one","two","three"];

        // initializes the element with opts
        constructor(opts) {
                super();
                this.time = opts.time || 0;
                this.timerHandle = setInterval(() => this.ticks(),1000);
        }

        ticks() {
                this.time++;
                this.update();  // refreshes the element
        }


        unmounted() {
                clearInterval(this.timerHandle);
        }
}