  ##server plugin module

    "server"ディレクトリには、以下のディレクトリが存在する。
    各々には"module"で定められる形式のプログラムモジュールが収められる。
    
    ロード順に、

        systems
        services
        plugins
        applications
       
       
    となる。よって、applicationに収められたモジュールはplugins、services、services
    に収められたmoduleに依存することが可能である。
    
    
           
##module

    moduleは、サーバサイドで動作する機能単位で、最小でも以下のような構成を持つ。
    
        api.js
        
            APIを処理するルーティングモジュール。
            各々のリクエストに対して、基本的にはAPI-ResponseであるようなJSONを返す。
            
        pages.js
            
            ページを処理するルーティングモジュール。
            各々のリクエストに対して、HTMLページまたはフラグメントを返す。
         
##一般的な流れ
        
       全体としてMVCパターンを応用する。 
       一般的な処理の流れにおけるモジュールの役割は以下のようになる。
       
       
       クレイアントサイドHTML(view)
                |
       クライアントサイドコントローラ(controller)
                |
       クライアントサイドサービス/リソース(擬似model)
                |
                | HTTPRequest
                |
       サーバサイドAPIルーター(擬似model)
                |
       サーバサイドコントローラ(controller)
                |
       サーバサイドモデル(model)
                |
     　パーシステント　         
                
                
###クレイアントサイドHTML

###クライアントサイドコントローラ

###クライアントサイドサービス/リソース

###サーバサイドAPIルーター

###サーバサイドコントローラ

        基本的には対象となるmodelに対するCRUDとQuery/Countで構成されるが、補助的なAPIを持つものもある。

###サーバサイドモデル
      
##モジュールの分類      
      
###systems module
  
    ユーザアカウント、リソースなどサービス上で基本的な部分についての動作を定義
      
###services module
    
    フォーム、アーティクル等、実際のサービスについての動作を定義
     systemsモジュールの使用を前提として良い
      
###plugins module

    メール、他サービスのAPI等の付加サービスについての動作を定義
    systems/servicesモジュールの使用を前提として良い
      
###applications module
      
    アプリケーション全体としての動作を定義
    systems/servicesモジュールの使用を前提として良いが、pluginsについては
    存在を確認する。
      
##gs

    gsモジュールは、各種汎用的・必須モジュールのパス・インスタンスを管理する。
    
    gsモジュールはルートディレクトリに存在し、各モジュールから単純に
    
       const core = require(process.cwd() + '/gs');
       
    と参照できる。
     gsモジュールには、以下のエントリーが存在する。
     
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
     
     


                               




##New View Template

###overview
    URL及びDatabaseをデータソースとして、テンプレートに展開する。
    
###URL
    
    
    USERID --- NAMESPACE ---|
                            |-----doc--------|
                            |                |
                            |                |----img------|
                            |                |             |
                            |                |
                            |                |
                            |                |----js-------|
                            |                |             |
                            |                |
                            |                |
                            |                |----css------|
                            |                |             |
                            |                |
                            |                |
                            |                |
                            |                |
                            |                
                            |
                            |----static------|
                            |                |
                            |
                            |
                            |----fragment----|
                                             |



    レンダリングを行い、ドキュメントを返す。
    http://DOMAIN/USERID/NAMESPACE/doc/PAGENAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT
    
    PAGENAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT　::= ソート式
    
    
    レンダリングを行い、フラグメントを返す。
    http://DOMAIN/USERID/NAMESPACE/fragment/DOCUMENTNAME/FRAGMENTNAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT

    DOCUMENTNAME ::= resource_name
    FRAGMENTNAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT　::= ソート式
    
    フラグメントは呼び元のドキュメント名とクエリーを引き継ぐ。
     
    
    レンダリングを行わず、documentを返す。
    http://DOMAIN/USERID/NAMESPACE/static/FRAGMENTNAME
        
    レンダリングを行わず、jsを返す。
    http://DOMAIN/USERID/NAMESPACE/doc/js/FRAGMENTNAME
    
    レンダリングを行わず、cssを返す。
    http://DOMAIN/USERID/NAMESPACE/doc/css/FRAGMENTNAME
               
    画像
    http://DOMAIN/USERID/NAMESPACE/doc/img/FILENAME
            
        
####要素

####展開式

    展開式は以下のような構文を持つ。
  
    c               :== {lower | upper | numeric | "_" | "-" | "#"};
    name            :== c, [{c}];
    resource_name   :== name - "#" "\"｜"/"｜":"｜"*"｜"?"｜"""｜"<" | ">" | "|"
    namespace       :== resource_name;
    filter_param    :== c, [{c}];
    filter_name     :== c, [{c}];
    filter          :== filter_name , '("' , filter_param , '")';
    field_name      :== name , { ".", name } , [{ == , filter}];
    field_element   :== "{" , field_name , "}";  
    field_formula   :== field_element , { "|", field_element };
    resource_name   :== {namespace ,"#"} , resource_name
    
    例
   
    {content.title.value}|{userid}|{content.type.value}
    
    {content.create.value == date("MM/DD")} 
    
    
    対応する値がない場合は""となる。


    (ADHOC実装なの... 本来はパーサーにすべき。)
  
####特殊な値

        #init
        #name:self
        #name:document
        #userid
        #query:self
        #pager
        
            #pager:page
            #pager:index
            #pager:current


#####Page URL Query

     特殊なfield_name"#init"は、ページクエリーの結果を参照する。
     
     <ds:foreach scope="#init">
         <ds:resolve field='field_formula'></ds:resolve>
     </ds:foreach>
                  
#####Name

    特殊なfield_name”#name:self”は、現在参照されているpageのURLに含まれるnameフィールドと置換される。
    ドキュメント内で使用可能 
    参照URL内で使用可能 
    
    特殊なfield_name”#name:document”は、現在参照されているfragmentのURLに含まれるdocumentnameフィールドと置換される。
    ドキュメント内で使用可能 
    参照URL内で使用可能     

#####Userid

    特殊なfield_name”#userid”は、現在参照されているpageのURLに含まれるuseridフィールドと置換される。
    ドキュメント内で使用可能 
    参照URL内で使用可能 
    
    例
        <LINK rel="stylesheet" href="/direct/|{#userid}|/style.css">
        
        は
        
        <LINK rel="stylesheet" href="/direct/000000000000000000000000/style.css">
    
        と展開される。
    
####Query

    特殊なfield_name”#query:self”は、現在参照されているpageのURLに含まれるqueryフィールドと置換される。
    ドキュメント内で使用可能 
    参照URL内で使用可能        
     
#####Pagenation

    特殊なfield_name"#pager"は、"#pager:page"で参照されるクエリーおよびindex、currentの配列を生成する。
    ドキュメント内で使用可能  
    
    特殊なfield_name"#pager:next"と”#pager:prev”は、ページクエリーを引き継いで、次ページ・前ページをクエリーするようなクエリー式を返す。
    ドキュメント内で使用可能 
         
    特殊なfield_name"#pager:index"はページを表す。
    特殊なfield_name"#pager:current"はページが現在のページの場合に真となる。
                   
    例
    
        ページクエリーが”?l=5&s=5”であれば、
    
        <a ds:href="/00000000000000000000/doc/test4|{#pager:next}">next</a>    
    
        は
    
        <a ds:href="/00000000000000000000/doc/test4?l=5&s=10">next</a>
     
        と展開される。
     
     
      特殊なfield_name"#hasprev"は、現在のクエリーによって得られる結果の前に要素がある場合は真となる
      
      特殊なfield_name"#hasnext"は、現在のクエリーによって得られる結果の後に要素がある場合は真となる
                     
                                    
####クエリー式

    現状は、公開されたcollection名とMongoDBのクエリー式,limit,skip,sortを以下のように連結したもの。
    
    key::name;
    
    を一つの要素とし、複数の要素を連結する。
    
    co::Article;q::{"content.type.value":"a"};l::10;s::2;so::{"name":1};  
    
    以下は、URLに含まれるクエリーを表す
    
    #query:self
    
 
#####Include

    HEAD要素内
        <meta ds:include="url"/>
        
    BODY要素内    
        <ds:include src='url'></ds:include>
        
#####resolve    
    
    <ds:resolve query='query'></ds:resolve>
    
    <ds:resolve scope='field_name'>

    <ds:resolve field='field_formula'></ds:resolve>
    
    <hoge ds:attr='field_formula'>

    例1
    
        <ds:resolve scope='content'>
            <img ds:src="{image.value}"/>
        </ds:resolve>
        
        query結果が{content:{image:{value:"X"}}}の場合、
                
        <img src='X'/>
                    
        と展開される。
        
    例2    
        
        <ds:resolve query='query'>
            <div ds:class="{a}|{b.a}">
                <ds:resolve field="{a}|{b.a}|{b.b}"></ds:resolve>
            </div>
        </ds:resolve>
    
        query結果が[{a:"X", b:{a:"Y", b:"Z"}},......]の場合、
        
        <div class='XY'>
             XYZ
        </div>
    
        と展開される。
    
  
#####foreach
    

    <ds:foreach query='query'></ds:foreach>
    
    <ds:foreach scope='field_name'></ds:foreach>

    <hoge ds:attr='field_formula'>

    例
    
        <ds:foreach query='query'>
            <ds:foreach scope="b">
                <div ds:class="{b.b}">
                    <ds:resolve field="{b.a}"></ds:resolve>
                </div>
            </ds:foreach>       
        </ds:foreach>
  
      
        query結果が[{a:"X1", b:{a:"Y1", b:["Z11", "Z12"]}},{a:"X2", b:{a:"Y2", b:["Z21", "Z22"]}}]の場合、
        
        <div class='Z11'>Y1</div>
        <div class='Z12'>Y1</div>
              
        <div class='Z21'>Y2</div>
        <div class='Z22'>Y2</div>
          

  
#####if

    <ds:if exist='field_name'>
    	   
    </ds:if>
    
    
#####例  
  
    ドキュメント”test”
  
    http://localhost:8000/doc/000000000000000000000000/test?l=10&s=0
    
        <!DOCTYPE html>
        <html lang="ja">
            <head>
                <meta ds:include="/|{#userid}|/n/fragment/|{#name:self}|/head"/>
            </head>
        	<body>
        	    <ds:include src='/|{#userid}|/n/fragment/|{#name:self}|/nav|{#query:self}'></ds:include>
        	    <div class="container" style="margin-top:70px;">
        	        <div class="jumbotron jumbotron-fluid">
                        <div class="container">
                            <h1 class="display-3">Fluid jumbotron</h1>
                            <p class="lead">This is a modified jumbotron that occupies the entire horizontal space of its parent.</p>
                            <img src="img/img16.jpg?w=100&h=100"/>
                        </div>
                    </div>
        	        <div class="card">
        	            <div class="card-header">query from url</div>
        	            <div class="card-body">
        	                <div class="row" style="column-count: 3;">
        	                    <ds:foreach scope='#init'>
        	                        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        	                            <div class="card">
        	                                <ds:resolve scope='content'>
                                                <img class="card-img-top" ds:src="{image.value}">
                                                <div class="card-body">
                                                    <ds:if exist='title.value'>
        	                                            <div ds:style="{klass.value}">
        	                                                <ds:h4 class="card-title">{title.value}</ds:h4>
        	                                            </div> 
        	                                        </ds:if>
                                                    <ds:div class="card-text" style="font-size:1vw">{desc.value}</ds:div>
                                                </div>
                                            </ds:resolve>
                                            <div class="card-footer d-flex justify-content-end">
                                                <ds:small class="text-muted">{create == date("MM月DD日")}</ds:small>
                                            </div>
                                        </div>
                                    </div>
        	                    </ds:foreach>
        	                </div>
        	            </div>
        	            <div class="d-flex justify-content-center">
        	                <ds:include src='/|{#userid}|/n/fragment/|{#name:self}|/pagenator|{#query:self}'></ds:include>
                        </div>
        	        </div>
        	        <div class="card">
        	            <div class="card-header">static query</div>
        	            <div class="card-body">     
        	                <ds:foreach query='q::{"content.title.value":"jjjjjjjj"};'>
        	                <div class="card">
        	                    <ds:resolve scope='content'>
                                    <img class="card-img-top" ds:src="{image.value}">
                                    <div class="card-body">
                                        <ds:if exist='title.value'>
        	                                <div ds:style="{klass.value}">
        	                                    <ds:h4 class="card-title">{title.value}</ds:h4>
        	                                </div> 
        	                            </ds:if>
                                        <ds:p class="card-text">{desc.value}</ds:p>
                                    </div>
                                </ds:resolve>
                            </div>
        	                </ds:foreach>
        	            </div>
        	        </div>
                </div>
                <ds:include src='/|{#userid}|/n/fragment/|{#name:self}|/scripts'></ds:include>
            </body>
        </html>
    
    
    
    フラグメント"pagenator"
    
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <ds:if exist='#hasprev:#init'>
                    <li class="page-item">
                        <a class="page-link" ds:href="|{#name:document}|{#query:prev}|">Prev</a>
                    </li>
                </ds:if>
                <ds:foreach scope='#pager:#init'>
                    <li class="page-item">
                        <ds:if exist='#pager:current'>
                            <ds:a class="page-link" style="color:#ff0000;" ds:href="|{#name:document}|{#pager:page}|">{#pager:index}</ds:a>
                        </ds:if>
                        <ds:ifn exist='#pager:current'>
                            <ds:a class="page-link" ds:href="|{#name:document}|{#pager:page}|">{#pager:index}</ds:a>
                        </ds:ifn>
                    </li>
                </ds:foreach>
                <ds:if exist='#hasnext:#init'>
                    <li class="page-item">
                        <a class="page-link" ds:href="|{#name:document}|{#query:next}|">Next</a>
                    </li>
                </ds:if>
            </ul>
        </nav>
    
    
    
    フラグメント"nav"
    
    	<nav class="navbar navbar-expand-sm navbar-light fixed-top bg-light">
            <a class="navbar-brand" href="#">Navbar</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link disabled" href="#">Disabled1</a>
                    </li>
                </ul>
            </div>
        </nav>
    	    
    	    
    	    
    フラグメント"head"	    
    
	    <meta charset="utf-8" >
	    <meta http-equiv="X-UA-Compatible"  content="IE=edge">
	    <title></title>
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <meta name="description" content="" >
	    <meta name="keywords" content="">
        <meta name="Robots" content="index,follow">
	    <meta name="author" content="">
	    
	    <meta property="og:title" content="" >
	    <meta property="og:image" content="" >
	    <meta property="og:url" content="" >
	    <meta property="og:site_name" content="" >
	    <meta property="og:description" content="" >
	    <meta name="twitter:title" content="" >
	    <meta name="twitter:image" content="" >
	    <meta name="twitter:url" content="" >
	    <meta name="twitter:card" content="" >
    
	    <LINK href="https://fonts.googleapis.com/earlyaccess/sawarabimincho.css" rel="stylesheet" async>
	    <LINK href="https://fonts.googleapis.com/earlyaccess/sawarabigothic.css" rel="stylesheet" async>
	    <LINK href="https://fonts.googleapis.com/earlyaccess/mplus1p.css" rel="stylesheet" async>
	    <LINK href="https://fonts.googleapis.com/earlyaccess/roundedmplus1c.css" rel="stylesheet" async>
	    <LINK href="https://fonts.googleapis.com/css?family=Oxygen:300,400" rel="stylesheet">
	    <LINK href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700"  rel="stylesheet">
	    <LINK rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.css">
	    <LINK rel="stylesheet" href="static/icomoon.css">
	    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
	    <LINK rel="stylesheet" href="static/style.css">
	    <SCRIPT src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js" ></SCRIPT>
    	
    
    
    フラグメント"script"
    
        <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></script>
	    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"></script>
	    <script type="text/javascript" src="/bower_components/lodash/dist/lodash.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular/angular.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-resource/angular-resource.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-animate/angular-animate.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-sanitize/angular-sanitize.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-messages/angular-messages.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-aria/angular-aria.min.js"></script>
        <script type="text/javascript" src="/bower_components/angular-i18n/angular-locale_ja-jp.js"></script>
        <script type="text/javascript" src="/bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
        <script type="text/javascript" src="/js/application.js"></script>
        <script type="text/javascript" src="/js/controllers.js"></script>
        <script type="text/javascript" src="/js/services.js"></script>
	    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"></script>
        <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></script>
	    <script type="text/javascript" src="static/main.js"></script>
    	
    
    
###resource

    mimetypeがtext/htmlの場合、Articleの値を参照可能
              
###form
                   
    入力フォームの項目はフォーム画面に依存するが、以下２つの項目は必須である。
    
        ng-model="form.report"
        
            問い合わせ通知先のメールアドレス
        
        ng-model="form.thanks"
        
            サンクスメールのメールアドレス
         
        
    メールでの問い合わせ処理には、以下の２つのページが必要。
    ページはフォームのデータを用いて通常と同じくレンダリングされる。
             
        問い合わせ通知
             
            inquiry__mail.html
                           
        サンクスメール
        
            thanks__mail.html
                          
                          
                         
    formを使用する場合は内部的にangular1.Xを使用しているため、干渉に注意                           
                               
                               
####フォームの例。
                          
    入力項目は"form"スコープに。                           
    	