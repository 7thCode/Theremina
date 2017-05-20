#server plugin module

    "server"ディレクトリには、以下のディレクトリが存在する。
    各々には"module"で定められる形式のプログラムモジュールが収められる。
    
    ロード順に、

        applications
        plugins
        services
        services

    となる。よって、applicationに収められたモジュールはplugins、services、services
    に収められたmoduleに依存することが可能である。
    
           
#module

    moduleは、サーバサイドで動作する機能単位で、最小でも以下のような構成を持つ。
    
        api.js
        
            APIを処理するルーティングモジュール。
            各々のリクエストに対して、基本的にはAPI-ResponseであるようなJSONを返す。
            
        pages.js
            
            ページを処理するルーティングモジュール。
            各々のリクエストに対して、HTMLページまたはフラグメントを返す。
            

#core

    coreモジュールは、各種汎用的・必須モジュールのパス・インスタンスを管理する。
    
    coreモジュールはルートディレクトリに存在し、各モジュールから単純に
    
       const core = require(process.cwd() + '/core');
       
    と参照できる。
     coreモジュールには、以下のエントリーが存在する。
     
        共有データモジュール
        
            shareモジュール
    
        共有コントローラ
        
            authコントローラ
            exceptionコントローラ
            accountコントローラ
            fileコントローラ
            analysisコントローラ
   
        共有モデル
        
            LocalAccountモデル
        
        共有機能モジュール 
        
            ShapeEditModuleモジュール
            ServerModuleモジュール
            AdaptorModuleモジュール
            HtmlEditModuleモジュール
     
     
   
#View Template

##resource

    mimetypeがtext/htmlの場合、Articleの値を参照可能

####評価

   　例
   
            article = {field1:"BBBB"};
            
            の場合、
   
           <div>AAAA|{"name":"field1","type":"string"}|CCCC</div>

            は
            
           <div>AAAABBBBCCCC</div>
    
            と評価される。同様に、Attributeは
            
          
           <div x='AAAA|{"name":"field1","type":"string"}|CCCC'>ZZZZ</div>

            の場合
            
           <div x='AAAABBBBCCCC'>ZZZZ</div>

            と評価される。
            
            
          type
            
                "string"
            
                    値を文字列としてそのまま評価
                
                "number"
                
                    値を数値として、Intl.NumberFormatによって評価、フォーマッティング。
                    
                    例
                        article = {field1:"10000"};
                        
                        <div>AAAA|{"name":"field1","type":"number","option":{"style":"currency","currency":"JPY"}}|CCCC</div>
                        
                        の場合、

                        <div>AAAA¥10,000CCCC</div>
       
            
                "date"
                
                    値を日付として、Intl.DateTimeFormatによって評価、フォーマッティング。
                                        
                "formula":
                 
                    値を式として評価。
                    
                ”function”
                
                    値を"value"としてoptionの"function"を関数として評価。

          
                "html"
                
                    HTMLとして評価（エスケープしない）
                         
            
####repeat            
            
   例         
   
            <repeat filter="Filter Object">
            ...
            </repeat>
            
            
            Filter Object ::= {"Field Name":"value", .....}
            
           
            
            ex
            
            article = [{field1:"QQQQ"},{field1:"WWWW"},{field1:"EEEE"}];
                        
             の場合、
            
            
            <repeat>
                 <div>AAAA|{"name":"field1","type":"string"}|CCCC</div>
            </repeat>
            
            は
            
            <div x='AAAAQQQQCCCC'>ZZZZ</div>
            <div x='AAAAWWWWCCCC'>ZZZZ</div>
            <div x='AAAAEEEECCCC'>ZZZZ</div>
            
            と評価される。
            
            
            また、
            
            <repeat＝"{field1:"QQQQ"}">
                <div>AAAA|{"name":"field1","type":"string"}|CCCC</div>
            </repeat>
                        
            は
                        
            <div x='AAAAQQQQCCCC'>ZZZZ</div>
                            
            と評価される。
                        
                        
       
            特殊な名前
                             
                 {create}
                 
                    Article作成時間
                 
                 {modify}
                 
                    Article更新時間
                        
                 {name}
                            
                     対象Article名      
                   
                     
                 {userid}
                                 
                     対象Article UserID                    
                        
                     
                 詳細ページへのリンクなどはこんな感じに使用
                        
                    <a href='http://domain.../articles/resource/|{userid}|/詳細ページ/|{name}'>詳細</a>
                         
                         
                 {count}
                         
                      対象Article数
                         
                 {next}
                         
                     次ページ先頭articleのindex
                     
                     
                 {prev}
                                          
                     前ページ先頭articleのindex
                     
                     
                 ページネーションの例
                     
                    <repeat filter='{"type":"work"}'>
		            	<p>{"name": "desc", "type": "html"}</p>
		            </repeat>
		            			
	                <div class="row">
	                    <a class="col-xs-2 btn btn-info" href="/site/|{userid}|/verb_index/a?o=%7B%22skip%22:|{prev}|,%22limit%22:4%7D">prev</a>
	                    <a class="col-xs-2 btn btn-info" href="/site/|{userid}|/verb_index/a?o=%7B%22skip%22:|{next}|,%22limit%22:4%7D">next</a>
                    </div>
                     	
                     	
                     							    
                query
                     							    
                   queryはArticleの内容を以下の規則にて検索
                     							    
                     {"name":"a"}は{"content.name.value":"a"}として検索される。							    
                     							    
                     							    
          
                URL
                
                    query = {}
                                
                    option = {"skip":skip,"limit":limit}
                    
                    direction = 1 or -1
                    
                    sort = {FIELD:direction}
                
                    /site/userid/[pagename]/[uniquearticlename]?o=option&q=query&s=sort
                
                    /site/000000000000000000000000/verb_index/a?o={%22skip%22:0,%22limit%22:4}&s={%22name%22:-1}    					    
                                