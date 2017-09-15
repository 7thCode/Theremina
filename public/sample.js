riot.tag2('sample', '<h3>{message}</h3> <ul> <li each="{techs}">{name}</li> </ul>', 'sample,[data-is="sample"]{ font-size: 2rem } sample h3,[data-is="sample"] h3{ color: #4 } sample ul,[data-is="sample"] ul{ color: #999 }', '', function(opts) {
        this.message = 'Hello, Riot!';
        this.techs = [
                { name: 'HTML' },
                { name: 'JavaScript' },
                { name: 'CSS' }
                ]
});
