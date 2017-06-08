  ##server plugin module

    "server"ディレクトリには、以下のディレクトリが存在する。
    各々には"module"で定められる形式のプログラムモジュールが収められる。
    
    ロード順に、

        applications
        plugins
        services
        systems

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
      
##core

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
     
     
##View Template

###resource

    mimetypeがtext/htmlの場合、Articleの値を参照可能

####評価

   　例
   
   
            セパレーターとして"|"を予約する
   
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
            
          ただし
            
          <div>AAAA|BBBB|CCCC</div>
          
            の場合は
            
           <div>AAAA|BBBB|CCCC</div>
             
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
            
            <repeat filter＝'{"field1":"QQQQ"}' sorter='{"field":["field2","field3"],"order":["asc","desc"]}'>
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
                               
    <div class="container" ng-app="Application">                                                     
        <div class="row" ng-controller="InquiryController">
            <form name="validate">
                <div class="form-group">
                    <label for="name">お名前</label>
                    <span ng-messages="validate.name.$error" class="pull-right">
                        <span ng-message="required">必須です</span>
                    </span> 
                    <input ng-model="form.name" name="name" type="text" required="true" class="form-control no-zoom" id="name">
                                				
                    <label for="thanks">メールアドレス</label>
                    <span ng-messages="validate.thanks.$error" class="pull-right">
                        <span ng-message="required">必須です</span>
                        <span ng-message="pattern">メールアドレスではありません</span> 
                        <span ng-message="maxlength">255文字までです</span>
                    </span> 
                    <input ng-model="form.thanks" name="thanks" type="email" required="true" class="form-control no-zoom" id="thanks" placeholder='xxxxxxx@domain.net' ng-maxlength="255" ng-pattern="/^[a-z0-9-._.+]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i">
                                
                    <label for="phone">電話番号</label>
                    <span ng-messages="validate.phone.$error" class="pull-right">
                        <span ng-message="required">必須です</span>
                    </span> 
                    <input ng-model="form.phone" name="phone" id="phone" required="true" class="form-control no-zoom" placeholder="Phone" type="text">
                                					     
                    <label for="message">内容</label>
                    <textarea ng-model="form.message" name="message" id="message" cols="30" rows="10" class="form-control no-zoom"></textarea>
                                						
                    <input ng-show="false" ng-model="form.report" name="report" type="email" required="true" class="form-control no-zoom" id="report" ng-init="form.report = 'oda.mikio@gmail.com';">
                                					
                    <input ng-click="Send();" type="button" class="btn btn-primary" value="Send" ng-disabled="validate.$invalid">
                    <input ng-click="Create();" type="button" class="btn btn-success" value="Create" ng-disabled="validate.$invalid">
                </div>
                <div ng-bind="error"></div>
            </form>
        </div>
    </div>
    
####対応する問い合わせメール例。
    
    inquiry__mail.html
    
    <div>
        <div style="background:#e8e8e8;text-align:center;" align="center">
            <div style="margin:0 auto;padding:30px 0 15px;width:540px;">
                <div style="background:#ffffff;border-radius:4px;border:1px solid #d4d4d4;font-size:14px;margin:0 auto;text-align:left;width:540px;" align="left">
                    <div style="color:#222;margin:0 auto;padding:40px 0;width:460px;">
                        <div>問い合わせ</div>
                        <div style="border-style:solid;border-color:black;border-width:1px;">
                        <div>from:|{"name": "thanks", "type": "string"}|</div>
                        <div>name:|{"name": "name", "type": "string"}|</div>
                        <div>phone:|{"name": "phone", "type": "string"}|</div>
                        <div>message:|{"name": "message", "type": "string"}|</div>
                        </div>
                        <div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>aaaaa</td>
                                        <td>bbbbbbbbb</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

####サンクスメール例。
    
    thanks__mail.html
    
    <div>
        <div style="background:#e8e8e8;text-align:center;" align="center">
            <div style="margin:0 auto;padding:30px 0 15px;width:540px;">
                <div style="background:#ffffff;border-radius:4px;border:1px solid #d4d4d4;font-size:14px;margin:0 auto;text-align:left;width:540px;" align="left">
                    <div style="color:#222;margin:0 auto;padding:40px 0;width:460px;">
                        <div>thanks</div>
                        <div style="border-style:solid;border-color:black;border-width:1px;">
                        <div>from:|{"name": "thanks", "type": "string"}|</div>
                        <div>name:|{"name": "name", "type": "string"}|</div>
                        <div>phone:|{"name": "phone", "type": "string"}|</div>
                        <div>message:|{"name": "message", "type": "string"}|</div>
                        </div>
                        <div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>aaaaa</td>
                                        <td>bbbbbbbbb</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
