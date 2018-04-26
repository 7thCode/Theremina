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
             |-----doc--------| 展開内容は再帰的に評価/展開される。
             |                |
             |                |
             |                |                          
             |                |----img------| 展開内容は単純に展開される。
             |                |             |
             |                |
             |                |             
             |                |----static---| 展開内容は単純に展開される。
             |                |             |
             |                |
             |                |             
             |                |----img------| 展開内容は単純に展開される。
             |                |             |    
             |                |
             |                |             
             |                |----js-------| 展開内容は単純に展開される。
             |                              |        
             |                              
             |
             |             
             |----fragment----| 展開内容は再帰的に評価/展開される。
                              |
             
             

    レンダリングを行い、ドキュメントを返す。
    http://DOMAIN/USERID/doc/PAGENAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT
    
    PAGENAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT  ::= ソート式
    
    
    レンダリングを行い、フラグメントを返す。
    http://DOMAIN/USERID/fragment/DOCUMENTNAME/FRAGMENTNAME?co=COLLECTION&q=QUERY&s=SKIP&l=LIMIT&so=SORT

    DOCUMENTNAME ::= resource_name
    FRAGMENTNAME ::= resource_name
    COLLECTION ::= コレクション名
    QUERY ::= クエリー式
    SKIP ::= スキップ数
    LIMIT ::= リミット
    SORT  ::= ソート式
    
    フラグメントは呼び元のドキュメント名とクエリーを引き継ぐ。
     
    
    レンダリングを行わず、フラグメントを返す。
    http://DOMAIN/USERID/static/FRAGMENTNAME
        
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
        #query:self         - query式
        #query:param_name   - query_paramのparam_name参照
        #position           - repeatのindex(0 origin)
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
        <LINK rel="stylesheet" href="/static/|{#userid}|/style.css">
        
        は
        
        <LINK rel="stylesheet" href="/static/000000000000000000000000/style.css">
    
        と展開される。

####Position

    特殊なfield_name”#position”は、クエリーデータのシーケンスを返す。
    
####Query

    特殊なfield_name”#query:self”は、現在参照されているpageのURLに含まれるqueryフィールドと置換される。
    ドキュメント内で使用可能 
    参照URL内で使用可能 
    
    "#query:hoge"は、参照URLの"hoge"クエリーフィールドを参照する。（クエリー継承)   
     
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
    
    
####クエリー継承

    "#query:hoge"によって参照URLの"hoge"クエリーフィールドを参照可能。（クエリー継承)   
      
    http://xxxx.xxxx.xxxx/xxxx.html?s=4&**hoge**=q::{"content.theme.value":"theme3"}
    
    で示されるテンプレート内で、
    
      <ds:foreach query='#query:hoge'>
         <ds:div>{content.theme.value}</ds:div>
      </ds:foreach> 
    
    は
    
       <ds:foreach query='q::{"content.theme.value":"theme3"}'>
            <ds:div>{content.theme.value}</ds:div>
       </ds:foreach>
          
          
          
####アグリゲーション式

    現状は、公開されたcollection名とMongoDBのクエリー式,limit,skip,sortを以下のように連結したもの。
    
    key::name;
    
    を一つの要素とし、複数の要素を連結する。
    
    co::Article;ag::[{"$group": {"_id":"$content.theme.value", "count": {"$sum": 1}}}];  
    
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
    
    query    
    <ds:foreach query='query'></ds:foreach>
    
    scope
    <ds:foreach scope='field_name'></ds:foreach>
    
    aggrigation
    <ds:foreach aggrigate='aggrigate'></ds:foreach>


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

    フィールド存在
    <ds:if exist='field_name'>
    	   
    </ds:if>
    
    定数値一致(field_name == value)
    <ds:if exist='field_name' match="value">
        	   
    </ds:if>
        
    フィールド値一致(field_name1.value == field_name2.value)
    <ds:if exist='field_name1' equal="field_name2">
            	   
    </ds:if>    

    フィールド値評価(field_name1.value == function(value) { return script })
    <ds:if exist="field_name1" condition="script">

    </ds:if>

    ex.

    クエリーフィールド参照

    <ds:if exist='#query:param_name' match="value">

    </ds:if>

#####Filter

   Date to string

        {field == date("date format")}

   Ex.
        {日時.value == date("YYYY年MM月DD日(ddd)")}


   部分文字列

        {field == substr("num")}

    Ex.
        {field == substr("1")}


    値変換

        {field == convert("{"key1":"value1","key2":"value2"}")}

    Ex.

        {種別.value == convert("{"注意":"btn-danger","危険":"btn-danger"}")



   EncodeURIComponent

        {field == encodeURIComponent("")}


    Ex.

        {field == encodeURIComponent("")}



    Numeric Add

        {field == add("num")}


   HTML Strip

        {field == strip("HTML")}




#####Elements

    
    <meta query='#query:self' ds:title="{x.y.z}">
    <meta name="description" query='#query:self' ds:content="{x.y.z}"/>
    <meta ds:include="/|{#userid}|/|{#namespace}|/static/styles.html"/>
    
    <ds:include src='/|{#userid}|/|{#namespace}|/static/measure_body.html'></ds:include>
    <ds:include src='/|{#userid}|/|{#namespace}|/fragment/|{#name:self}|/pagenator.html|{#query:self}'></ds:include>
    
    
    <ds:resolve query='#query:self'></ds:resolve>
    <ds:resolve scope='content'></ds:resolve>
    
    <ds:resolve aggrigate='ag::[{"$match":{"$and":[{"a.b.c":"x"},{"a.b.c":"x"}]}},{"$project":{"a":"$a.b.c"}},{"$unwind":"$a"},{"$group":{"_id":"a","a":{"$addToSet":{"item":"$a"}}}}];'>
    </ds:resolve>
    
    <ds:foreach query='#query:seminar'></ds:foreach>
    <ds:foreach query='#query:theme'></ds:foreach>
    <ds:foreach query='#query:self'></ds:foreach>    
    <ds:foreach query='q::{"$and":[{"x.y.z":"a"},{"x.y.z":"a"}]};s::0;l::10'></ds:foreach>
    
    
    <ds:foreach scope='#pager:#init'></ds:foreach>
    
    <ds:foreach aggrigate='ag::[{"$match":{"$and":[{"a.b.c":"x"},{"a.b.c":"x"}]}},{"$project":{"ym":{"year":{"$year":"$content.from.value"},"month":{"$month":"$content.from.value"}}}},{"$group":{"_id":"$ym","count":{ "$sum" : 1 }}},{"$sort":{"_id.year":-1,"_id.month":-1}}];'></ds:foreach>
    
    <ds:foreach aggrigate='ag::[{"$match":{"$and":[{"a.b.c":"x"},{"a.b.c":"x"}]}},{"$project":{"content.theme.value":1,"result":{"$and":[{"$lt":["$content.from.value",new Date()]},{"$gt":["$content.from.value",new Date(new Date().setDate(new Date().getDate() - 7))]}]}}},{"$group": {"_id":"$content.theme.value", "new": {"$max":"$result" }, "count": {"$sum": 1}}}];'>
    </ds:foreach>
    
    
    
    <ds:if exist='#hasprev:#init'></ds:if>
    <ds:if exist='#pager:current'></ds:if>
    
    
    <ds:ifn exist="x.y"></ds:ifn>
    
    
    
    
    <ds:div>{x.y}</ds:div>
    <ds:div>{x.y == substr("40")}</ds:div>
    <ds:div>{x.y == date("YYYY年MM月DD日(ddd)")}</ds:div>
    
    ds:src="{x.y}"
    ds:class='panel |{x.y == convert("{"セミナー":"panel-success","勉強会":"panel-warning"}")}' 
                                                     
                       
    
    
#####例  
  
######ドキュメント”index”

######フラグメント"pagenator"
    

    
    
######フラグメント"nav"
    

    	    
    	    
######フラグメント"head"	    

    
######フラグメント"script"
    

    
    
    
    
    
    
    
    
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







