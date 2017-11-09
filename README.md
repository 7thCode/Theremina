#Theremina CMS

##Overview

    TODO
    
    
    基本
    
    
    2種類のデータソース
    
    1.データベース
    
    2.ファイル
    
    
    ページとアーティクル
    
    ページとは、表示されるHTMLの雛形となるHTMLテンプレートです。
    通常のHTMLには存在しない要素を使用することで、通常ではちょっと
    厄介なページの内容（動的なHTMLモジュール、可変長リスト、ページネーションなど)が
    簡単に実現できます。
    
    アーティクルは、ページに表示される内容を納めるためのレコードセットです。
    アーティクルは名前と値のセットで、アーティクル編集機能で作成/変更/削除が簡単に行えます。
    
    簡単に言うと、ページに指定された各種情報(クエリー、フィールド名など)から導かれるアーティクルを所定の
    位置に展開することで、実際のHTMLドキュメントを作り出して返すという
    
     
    しかし実際のところ、アーティクルの構造自体はあまり重要ではありません。
    
    
    

##Getting Started

    まず、シンプルなページを作ってみましょう。
    ２つの
    
    	from.txt
    	
    	    Hello world!
    	
    	
    
    	to.html
    	
            <html>
                <body>
                    <ds:include src='/|{#userid}|/|{#namespace}|/fragment/|{#name:self}|/from.txt'></ds:include>
                </body>
            </html>
    
    
    
    
    
    
    
    アーティクルを一つ登録
    
        
        <html>
            <body>
                <ds:foreach scope="#init">
                    <ds:div>{content.title.value}</ds:div>
                </ds:foreach>
            </body>
        </html>
            
    
###Install

    TODO

##View Template

###overview
    URL及びDatabaseをデータソースとして、テンプレートに展開する。
    
###URL
    
    USERID --|
             |
             |             
             |-----doc--------|　展開内容は再帰的に評価/展開される。　
             |                |
             |                |
             |                |                          
             |                |----img------|　展開内容は単純に展開される。
             |                |             |
             |                |
             |                |             
             |                |----static---|　展開内容は単純に展開される。
             |                |             |
             |                |
             |                |             
             |                |----img------|　展開内容は単純に展開される。
             |                |             |    
             |                |
             |                |             
             |                |----js-------|　展開内容は単純に展開される。
             |                              |        
             |                              
             |
             |             
             |----fragment----|　展開内容は再帰的に評価/展開される。
                              |
             
             

    レンダリングを行い、ドキュメントを返す。
    http://DOMAIN/USERID/doc/PAGENAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT
    
    PAGENAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT　::= ソート式
    
    
    レンダリングを行い、フラグメントを返す。
    http://DOMAIN/USERID/fragment/DOCUMENTNAME/FRAGMENTNAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT

    DOCUMENTNAME ::= resource_name
    FRAGMENTNAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT　::= ソート式
    
    フラグメントは呼び元のドキュメント名とクエリーを引き継ぐ。
     
    
    レンダリングを行わず、フラグメントを返す。
    http://DOMAIN/USERID/direct/FRAGMENTNAME
        
    画像
    http://DOMAIN/USERID/photos/FILENAME
            
        
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
        #position
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
####Position

    特殊なfield_name”#position”は、クエリーデータのシーケンスを返す。
    
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
    
#####Include

    HEAD要素内
    
        <meta ds:include="url"/>
        
    BODY要素内
    
        <ds:include src='url'></ds:include>
        
        
       
#####resolve    
    
    HEAD要素内
    
        <meta name="xx" query="query" ds:content="field_element" />   ->    <meta name="keywords" content="XXXXXX" />
       
        <meta query='query' ds:title="field_element">                 ->    <title>XXXXXXXXX</title>
    
        
    BODY要素内 
    
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
  
######ドキュメント”index”
  
    http://localhost:8000/doc/000000000000000000000000/test?l=10&s=0
    
        <!DOCTYPE html>
        <html lang="ja">
        <head>
        	<meta ds:include="/|{#userid}|/|{#namespace}|/fragment/|{#name:self}|/head.html"/>
        </head>
        <body>
        <ds:include src='/|{#userid}|/|{#namespace}|/fragment/|{#name:self}|/nav.html|{#query:self}'></ds:include>
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
        											<ds:h4 class="card-title">{#position}|. |{title.value}</ds:h4>
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
                     <ds:include src='/|{#userid}|/|{#namespace}|/fragment/|{#name:self}|/pagenator.html|{#query:self}'></ds:include>
        		</div>
        	</div>
        	<div class="card">
        		<div class="card-header">static query</div>
        		<div class="card-body">
        			<ds:foreach query='q::{"content.title.value":"a"};'>
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
        <ds:include src='/|{#userid}|/|{#namespace}|/static/scripts.html'></ds:include>
        </body>
        </html>
    
    
    
######フラグメント"pagenator"
    
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
    
    
    
######フラグメント"nav"
    
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
    	    
    	    
    	    
######フラグメント"head"	    
    
	    	<meta charset="utf-8">
        	<meta http-equiv="X-UA-Compatible"  content="IE=edge">
        
        	<meta name="viewport" content="width=device-width, initial-scale=1">
        
        	<meta query='q::{"content.type.value":"free"};' ds:title="{content.title.value}">
        	<meta name="description" query='q::{"content.type.value":"free"};' ds:content="{content.title.value}" />
        	<meta name="keywords" query='q::{"content.type.value":"free"};' ds:content="{content.title.value}" />
        		
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
        	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
        	<LINK rel="stylesheet" href="css/style.css">
        	<SCRIPT src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js" ></SCRIPT>
    
    
######フラグメント"script"
    
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></script>
	<script type="text/javascript" src="js/main.js"></script>
    	
    
    
    
    
    
    
    
    
    
    
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
     
     


                               





    	
    	
#memo    	

    
##sudoでパスが通らない場合
    /etc/sudoers

    Defaults    env_reset
    
    を
    
    Defaults    env_keep += "PATH"

    コメントアウト
    #Defaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin
    
## Build-essential
### Ubuntu
    sudo apt-get update
    sudo apt-get install build-essential
    
    sudo apt-get install python
        
## 依存する物
    node.js - プラットフォーム
    mongodb - メインストレージ

## Adduser
    adduser hoge
    gpasswd -a hoge sudo
## Node Install
### Ubuntu/Mac    
    まず、nodebrewをインストール
        
    curl -L git.io/nodebrew | perl - setup
    export PATH=$HOME/.nodebrew/current/bin:$PATH
        
    nodeをインストール
        
    nodebrew install-binary v6.X.0
    nodebrew use v6.X.0
## Windows
    see http://qiita.com/takuyakojima/items/780b3b3133a17cceb175
## mongodb Install
### Ubuntu
    sudo apt install mongodb
    sudo apt install mongo-tools
### Mac(Homebrew)
    brew install mongodb
### Windows
    see http://qiita.com/moto_pipedo/items/c3bb40370ba2792143ad
##クエリーロギング
    スタート
    db.setProfilingLevel(1,20)
    ストップ
    db.setProfilingLevel(0)
## Redis Install
### Ubuntu
    sudo apt-get -y install redis-server
### Mac(Homebrew)
    brew install redis
### Windows
    see http://qiita.com/okoi/items/3bb5ae26ad559e4f39a0
## Redis設定
    sudo service redis start
### Ubuntu
    /etc/redis/redis.conf
### Mac(Homebrew)
    /usr/local/etc/redis.conf
    /usr/local/var/log/redis.log
### 設定値
    requirepass zz0101
    maxmemory 500MB
    maxmemory-policy volatile-ttl
## mongodbたまに実行
    $ mongo
    > use admin
    > db.runCommand( { logRotate : 1 } )
    
###localでmongoをcsvで落とす方法（例）
    mongoexport --host=127.0.0.1  --db test2 --collection businesscards --out businesscard.csv  --type=csv --fields=Template,UpdateDate

###上記のmemo
    mongoexport -d login -c accounts -o hoge.csv --csv --fields=_id,Theme.Homepage,Theme.Panflet,local.key,local.category,local.address,local.nickname,local.email,SiteTitle
    
##Mongoアクセス範囲
    
    全てからアクセス可能
    
    > cd /etc
    > sudo nano mongod.conf
   
    で
   
    bindIp: 127.0.0.1
    
    を
 
    bindIp: 0.0.0.0
      
    > sudo service mongod restart  
    
### Ubuntu
    /var/log/mongodb
    rm mongo.log.2016*
### Mac
    /usr/local/var/log/mongodb
    rm mongo.log.2016*
    
## mongodb 

###起動スクリプト

    /etc/init.d/mongodb
    
###起動コマンド    

    > sudo service mongodb stop
    > sudo service mongodb start
    > sudo service mongodb restart
    
## mongodb 初期化
    $ mongo
    > use admin
    > db.createUser({user: "admin",pwd: "zz0101",roles:[{role: "userAdminAnyDatabase",db: "admin"}]})
    > use blog0
    > db.createUser({user:"blog0master", pwd:"33550336", roles:[ "readWrite", "dbOwner" ]})
## Redis Clear
    $ redis-cli
    > AUTH zz0101
    > FLUSHALL
##pm2
    see http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
#####Install      
    sudo npm install pm2 -g
    sudo pm2 startup ubuntu
#####Use  
    sudo pm2 start start.json --env production
    sudo pm2 save
#####Test  
    sudo reboot
      .
      .
      .
    sudo pm2 list
#####メモリー（GC) 
    > sudo pm2 start app.js --node-args="--optimize_for_size --max_old_space_size=920 --gc_interval=100"       
#####Cluster

    cluster.json(例)
    
        {
          "apps" : [
          {
            "name"        : "app",
            "script"      : "app.js",
            "instances"  : 2,
            "exec_mode"  : "cluster_mode",
            "args"        : [],
            "node_args"   : "--optimize_for_size --max_old_space_size=720 --gc_interval=100",
            "env": {
              "NODE_ENV": "development"
            },
            "env_production" : {
              "NODE_ENV": "production"
            }
          }
          ]
        }


    > sudo pm2 start cluster.json --env production
#linuxエトセトラ
##ユーザ
#####USER追加
    adduser USER
#####USERをGROUPに追加      
    gpasswd -a USER GROUP
#####GROUPを追加   
    groupadd GROUP
#####GROUPを確認  
    groups USER
##ディレクトリ
#####中身ごと削除
    rm -R DIRECTORY
##プロセス
#####確認
    ps -elf
##シンボリックリンク(ショートカットっぽいの)    
#####作成
    ln -s
    
    
##ドメイン(Nginx)

####最新版インストール

    /etc/apt/sources.list　に追記

    deb http://nginx.org/packages/ubuntu/ trusty nginx
    
    「trusty」てのはでDebian系のバージョン表記なんだって。
    なので、適宜変えてね。
    
    apt-get update
    
    sudo service nginx stop
    
    sudo apt-get remove nginx-common
    
    sudo apt-get install nginx
    
    sudo service nginx start
    
#####ディレクトリ
      cd /etc/nginx
#####存在すべきサイトとして登録
      cd sites-aveilable
      cp default xxx.vvv.jp.conf
#####編集
      sudo nano xxx.vvv.jp.conf

      server {
              client_max_body_size 50M;
              listen        80;
              server_name   ドメイン(xxx.netなど);
              #return 301   https://$host$request_uri;
              #access_log   logs/host.access.log  main
      
              location / {
                        proxy_buffering off;
                        proxy_pass アドレス(http://128.199.232.217:20000など)
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "upgrade";
                        proxy_redirect http:// https://;
                        }
              }
              
      Let's EncryptでHTTPSならば        
              
      server {
              client_max_body_size 50M;
              listen 443 ssl;
              
              (nginxが1.9.6以上ならば)
              
              listen 443 ssl http2;
              
              server_name ドメイン(xxx.netなど);
              ssl_certificate      /etc/letsencrypt/live/[ファイル名確認]/fullchain.pe$
              ssl_certificate_key  /etc/letsencrypt/live/[ファイル名確認]/privkey.pem;
      
              #access_log  logs/host.access.log  main;
      
              location / {
                  proxy_buffering off;
                  proxy_pass http://localhost:30000;
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection "upgrade";
              }
      }        
      
      cd ../sites-enabled
      ln -s ../sites-aveilable/xxxxx . 


####開始/終了/再起動

    終了
    sudo service nginx stop

    開始
    sudo service nginx start

    再起動
    sudo service nginx configtest

##Backup

####full backup
    
    > sudo service mongodb stop
    > sudo mongodump --dbpath /var/lib/mongo

####full restore
    
    > sudo service mongodb stop
    > sudo mongorestore --dbpath /var/lib/mongo dump


####buckup

    > cd ......
    > mongodump -u .... -p .....
    
####restore

    > mongorestore --host localhost --db test_db ./dump/test_db

####Zip

    zip -r dump.zip dump
    
####SCP
    
     scp dump.zip XXX.XXX.XXX.XXX:/path/to/dist

####sudo
    
    pathを引き継ぐ。(digital ocean, etc..)
    
    Defaults    env_reset
    #Defaults   secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    Defaults    env_keep += "PATH"
     
####mail

    sudo saslpasswd2 -u seventh-code.com -c oda
        
##Mecab ユーザ辞書

     mac(homebrew)

     /usr/local/Cellar/mecab/0.996/libexec/mecab/mecab-dict-index  -d /usr/local/lib/mecab/dic/ipadic -u /usr/local/lib/mecab/dic/userdic/music.dic -f utf-8 -t utf-8 mecab_music_dic.csv

     /usr/local/etc/mecabrc

     ubuntu(apt-get)

     /usr/lib/mecab/mecab-dict-index                               -d /usr/share/mecab/dic/ipadic     -u /var/lib/mecab/dic/music.dic               -f utf-8 -t utf-8 mecab_music_dic.csv

     sudo nano /etc/mecabrc

####GMail

    セキュリティ
    
    https://myaccount.google.com/u/1/security
    
    安全性の低いアプリの許可: 有効　とする
    
####Let's Encrypt（HTTPSの認証)

    ここ見ろ
    
    https://letsencrypt.jp/usage/
        
    まず、certbot-autoってのをインストール
    
    > cd ~
    > mkdir certbot
    > cd certbot
    > wget https://dl.eff.org/certbot-auto
    > chmod a+x certbot-auto
    > sudo service nginx stop
    > ./certbot-auto
        エラー出たら
    > ./certbot-auto certonly
    > sudo service nginx start

    
    実行
    
    > cd ~
    > cd ceartbot
    > sudo service nginx stop
    > ./certbot-auto certonly --no-self-upgrade -n --standalone  --agree-tos --email oda.mikio@gmail.com -d www.aaa.com
    > sudo service nginx start
    
    -nginxってのが使える？使うと楽？
    
    
    更新
    
    > cd ~
    > cd certbot
    > sudo service nginx stop
    > ./certbot-auto renew -q --no-self-upgrade
    > sudo service nginx start
    
    証明書の取得時に使用したオプションは
    
    /etc/letsencrypt/renewal/${DOMAIN}.conf
   
   
##openssl
   
    作るもの
   
    秘密鍵
    公開鍵
    証明書
   
####秘密鍵
   
    openssl genrsa -aes128 1024 > server.key
   
####公開鍵
 
    openssl req -new -key server.key > server.csr   

####証明書

    openssl x509 -in server.csr -days 365 -req -signkey server.key > server.crt
   
   
   
   
   
# 独り言

## Angular2 + Node.js

###angular-cliでなんかつくる
    そこのディレクトリで
        npm install express --save
        npm install cookie-parser body-parser morgan --save
        
###srcディレクトリにapp.jsつくる。
    
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        
        var app = express();
        
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(__dirname));
        
        app.get('/*', function (req, res) {
          res.sendFile(path.join(__dirname,'index.html'));
        });
        
        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });
        
        
        if (app.get('env') == "development")
        {
          app.listen(3000, function () {
            console.log('Example listening on port 3000!');
          });
        }
        else{
          app.listen(8080, function () {
            console.log('Example listening on port 8080!');
          });
        }
        
        module.exports = app;

    
###iOSのBase64 Tips
                     
      NSData通るとなぜか"+"が" "になってるんです。
      逆変換するべし。。。？？？
      なんかあるんやろな。。
      こんなかんじ。  
      
      let data1 = data0.replace( / /g , "+" );
     
##心がけよう

    シンプルに。
    迷う時はシンプルな方に。
    ソフトウェアの最大の敵は複雑性。ソフトウェア工学は複雑性と戦うための武器。複雑性を閉じ込めろ。
    複雑性とは関連する物とその関連性の数。
    まずは名前が大事。
    各種のモジュールやら変数やらの名前が決まったら、半分くらいはできたようなもん。
    ソースのサイズは複雑さに非らず。長くてもシンプルに。
    変数名は可能な限りフルスペル。スペルの省略には個性が入り混じってしまう。コピペ多用すべし。
    コピペも満足にできないようなのは"エディタ"じゃない。それはなんか苦行強いる宗教の類。。。
    「俺のソースは短いよ！かっこいいだろ！」は、ホビイスト。
    ソースが表現の全て。可能な限りソースで処理を表現すべし。
    可能な限り処理自体にヒントを埋め込め。それを冗長とは言わない。
    コメントよりヒント。ソースで表現できない部分のみ文章で補う。
    言語固有の変な書き方はやめよう。まずは言語間の移植性、次に言語設計者の意図、次にシンプルさ。
    コピペ最強。なんせキーボード打つより間違わない。可能な部分は可能な限りコピペは義務。
    フルスペルの長い名前をコピペ。
    起動時、初期化時に可能な限りの処理を“試用”すべし。立ち上がればほぼ動作する感じで。
    何かが少しでもおかしい場合は大騒ぎするように。異常を隠すのは無意識でも罪。
    「遅い、早い、大きい、小さい」は相対評価。「効率がいい、悪い」が絶対評価。
    最適なアルゴリズムを採用すれば、シンプルになる。複雑だと感じたら基本から考え直そう。
    ソフトウェアの「技術力」とは複雑性をいかに克服できるかの度合い。複雑さの「達成」度合いではない。
    知識はエントロピー、広がれば無意味。
    人間、焦ると力押しに走る。それが終わりの始まり。
    他に何か理由があるでもなく、１度しか使わないような”関数”は展開しよう。関数にすることで複雑性を上げるだけ。
    長い処理はダメだけど、短い処理が絡まってるのもダメ。メリハリ、バランス。(例えるなら一つの章に会話一回なんて小説、ただのアバンギャルド...)
    
   
    
#### "a || b"パターンの使用は控えよう。

    完全にJavaScriptに閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    平たく書けば

        let result = HOGE || PIYO;

    は

        let result = HOGE;
        if (!HOGE) {
            result = PIYO;
        }

    なんら条件分岐が減るわけでもなく、単純にタイピング量wが減るだけ。。
    "a"がfalsyなら"b"って...
    たくさーん連結すればなんかいいこともあるかな？
    最後のtrueまで評価なんだろうな。。知らんけど。
    なんかなあ。。。
    
    ソースのサイズは複雑さに非らず。
    キーボード打つのがそんな嫌いなら、この商売向いてないよ？
    
#### "!!"パターンの使用もあかん。

    これも完全に形無し言語に閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    ちゃんと"Boolean()"しよう。それだけ。
    

####パターン・イディオムは無理やり使わない

    適応できない部分はあっさり諦めよう。
    パターンを変化させればもはやそれはパターンではない。


####TypeScriptの"this"は罠あり

    Mongooseで

    HogeSchema.static("hogeFunc", ():void => {

      this.....

    });

  と

    HogeSchema.static("hogeFunc", function():void {

      this.....

    });


    だと、下はthisが暗黙で_thisになるため、うまくない。
    thisあれば素直にfunctionかな。
    つくづくかっこ悪い言語。


####いつか使う

        
  node-config
  
        すぐにもできるけども。。。
        
        https://github.com/lorenwest/node-config
              
              
  WebDriver
  
        インストール(Mac Homebrew)
        
        brew install selenium-server-standalone
        brew install chromedriver

        起動(Mac Homebrew)
        
        java -Dwebdriver.chrome.driver=/usr/local/bin/chromedriver -jar /usr/local/Cellar/selenium-server-standalone/3.6.0/libexec/selenium-server-standalone-3.6.0.jar

  GraphQL
  
        あんまり好きくない感じ。。。
        サーバ・クライアント間で型安全。
        
       
  ECMAScript パーサー
    
        http://esprima.org/
        
  ジェネレータ
        
        https://github.com/estools/escodegen
        
  Parser API
        
        https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Expressions