/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
//wgxpath.XPathResultType.STRING_TYPE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CrawlerModule;
(function (CrawlerModule) {
    const wgxpath = require('wgxpath');
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const request = require('request');
    class Crawler {
        constructor() {
            this.count = 0;
        }
        constractor() {
        }
        //   public setCookie(cookies) {
        /*
        let cookie  = request.cookie('B=5635uttc79b6h&b=4&d=nqPtuxtpYF20p87x.lJPGbNFRFHKUZkQUunHTJFp&s=4p&i=nkm9FaKwUuQVDdlLrIRm');
        this.jar.setCookie(cookie, '.yahoo.co.jp');
        cookie = request.cookie('F=a=Y9jiS7IMvSEJhr.K8FUEGbrdRnoxrzZyg4F.FufSJrEu1CEr6gto_YivWz6IbQrSgfodHIo.GCfpksF9Xka4eVIN62PCHD8TGGJLEx9vI5Z2rP07q6FZoCe_8CwjzbY-&b=5HUX');
        this.jar.setCookie(cookie, '.yahoo.co.jp');
        cookie  = request.cookie('JTC=ZpYEsGGK85p6YirlIKiRZqUHZ3o.nrs-');
        this.jar.setCookie(cookie, '.yahoo.co.jp');
        cookie  = request.cookie('YLS=v=2&p=1&n=1');
        this.jar.setCookie(cookie, '.yahoo.co.jp');
        cookie  = request.cookie('_dgma=bc4f806e-3467-475d-adcc-e04073dc89e1');
        this.jar.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('_dgmc=bc4f806e-3467-475d-adcc-e04073dc89e1.1507685923257');
        this.jar.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie("anj=dTM7k!M4/K@/_VjeycmsKT>jCqGcT+b7moOC+R9.Wd=JjVMzB.p@Ms[6J_keh`>TYa'C0Ow1nvIN.zJ%PxZ?6G1mEw16ay%Au84d624l8Bo@#=WD7+?1=1qp]`oUj`6/OiY!I*xWg+aER/J.EmSJ:ls.^`zNq!oG4kT'1$(gQHs8=?FL3+EB)guR0T3i+7K1nyBKS4kJZ#!I>=lDZc9nVW7B=@DyRapjPHa?i*g:_kx7iEDFwQctM4SBtTN15J*AXKzrYw'h+/ba@C+F%)a?znA.[AN!4uW7XK5R/F<h`QNn`xCAFF>zw^2sR?yB9QxOx$p%Uc5$<b!+7UJUSU4T-1TVJ'O3oO>NPr1M13qFVk*J]Hzck)uM$UVca?:Yu6^3b=S<GI>TEsQrcnFei1'CR-xWojS/jvUNA%7fh>y11S2JZXAMmzQk:-NSI4p8-<'4vmi1++cZ11aM6(Q6gL^pKP$d0ukYP>3Yu`26^4^8xY'EcVLLrG[cwqYhc9+fmUv:P/2#!CYOSq'D'KpcFL!UZR_rhJbNanpIt3?.nOZwuDHHZgs^x9OK8ce?Wp!oCHcWv3^c3NW$tX'5-x9*qzvPP<D@8`1W=$][L)wb6:qmg[+AB7++v4iD-$i$'Q`AYnb3$6WD?t>djot(m/T4'R-[!)2.#57>+=j[X'TM%]B9t`3xL:=wBw%lM%EBld%QjWGJ0]V=np:GA0QMkLSwf!07Eb]+/qa@@_l*g0RBp_yv5:e6FxpVwQQdIq%w-1v2@JkmMy#x_%MOcN!6!DT%w3l`3_dBTvLBPBvpWus0>LSa@5@RZgY2`9D%%%XxX!bA(?:]01u].U'8#a#B_RW[H`RU^Ip2+WcvE$9%qWkWj[jb[7m*3kfD]O4[:c)W0Hfo8GIDfPk5-iyU$'TeZooZ2EaI[`NBnZw*)iYwFvg?.<H4g5g>fOYMh$)S#4J2n/y%X7tt^/c3]EN(!dUSBjHNx]ud0Swc7!o>_9gK1P#*5*6Q[faEQ<jIk0Yx8A0.apgTn[f%*HInOf>`3_5]J+<mi(/*z/%bac-/6N2RnS/l((47nqFx4):9a(jZxfANrs]SHgN.vvLLFB!A_Y5QLuk52/rcO=d*<Vy=QF'U-CylKc$>>:Or4a7Q+iqoEsTCgN<gAtuYtheUDZlZ<tfPm4$+'LFAP?HHJM7Q+KEWj^Hv1]A0>vc8)_/b*`#bm7B/xv%?0H:6ef!#U_^/i5]3cp*S/W]Q=S$W$z8'cQpiQQ_I^n5vh:MeGQYSxBQvb`0_@<#r2'7TvIBIFRIm>a@]wcoS%y1#T#dWm:!Aa+=uf)>v#G0!_ZR@`8Q+^]q#Kq8j82pp22?_b<YA[C::gr'E=6dGUP<Afp2FWfTnw4Xb0_1E83<gGf^'m_g=`(g16Sp@pbdZA3HIQeIto]<G<ta?jD?woJd4ROrcEVQu0x?ousYzTKOVp7ojmq%GtjoYJaMkv1aynR*^cI`Bv/ynavaM`o/cOt<!A>P+._^U6'IM]]eBWTfy:7Ak``:g<Y2%ei0#=.tBR<`h9[rf)02pz[51E^aMr@8=%:`6O8)ZY_8I8p<[WNU::vFv*cA.-c!5<%FcX=^DHdRiTUM5*2dW]=HLN_-hO:lQ!v=LPWjhuv6Bpr(>4f8=DJQW]qARPx=XKf#GqHvEBAb)0bF+[>79?DVViM8Y@TBLZk8P+t+aU4lC!GYM7G5sF[?Bg@7Zi6ohGV/^c^BEeg]2R`W<mlGrVRQJ:4</JJfa(yV[uFl/%n.Tc(ot/L_Llr?5%vo50(xbBvJ^uaCO3wjtssT.1Nh]/`gn!:q=Dlen/!v_qNPUoHedZ2]MC]Y`tg^nUI-9g@YUhWC^Hbb@2]d5vB.?)%o[_nhcUol4wZ!>'9`Eo.Ys<li93wCEoFtoljTFR/#j4A1QkX[Kg-S7SUKW7(UO[Ri27`@JrIsDF2BsWHwEU-59t^-3#H^#N^GDx9y=op.5)tptA]>')!dd`:'UhV))-]sCm532z@@2(KFo_Gmix$FJ$o.<FU+DG:-]:NvtH>AowVFF4.5.MTmqpLe#P8ph>bOSfk@9^05)SgJ?tBOjN7r#EH5y7t1Ue9CT1:5i=xv2r$KhL].bckF#/uBR?W0<(]O]=s3A/Yu`__jfy+$rLxM+I+HjRVVuO)Xm4Q+P[R:9k0iz-GsH=[Isn_uUD^3)^M=51e%Yg=`J?SG^zro_k$us9vse#cU6iVB7`l((>9L<uhI0/3677L9oR[_V5=]X5/(*(4=$HgW9X*W?#$utI*)#A:");
        this.jar.setCookie(cookie, '.adnxs.com');
        cookie  = request.cookie('bt3=N9FJLA-iIRfBHvb1y4uHYVK7zqFjh_aFJfnfujtBqwZvV7gdLpoHAz67oPN24nxV');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btext.vGtt1zQG=65c61626-1c5f-411d-af9f-7a712e5533e1');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btfc.8FzrfRY=1');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.8FzrfRY=UrL_ty3QyzW1ILvNSxLJEzJpEysNj_nVpjswhJJagWrgZda9Ro8f5GjSXtgV-850CgH6fAZ4ZJ9-Sf2Yhhdnp2UxX5GNKzHQ_fmU1QcisRbVZhyCQjUA0CJPxkmIackPkLX6skVNinfM9M3RiYhdu-q-O45TtZMkM7or6Z_gSL-3oK4USrMuQ92McZc3r26D0Rh0fmXcL92NCvtJfoXjKw');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.GvIpabp=F-810SmkxUhHq3zAIQ8Q4ZBs9tQBWBV1IBFqyUldiWefevpnnD5rgzTmWD4a_8DD');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.HgXyswR=4LIYs0Bd3hkUowB1FMKbiJKH38UFjTRW_A-DlawHnPsff02IQSvUZvd3kinaHFlq96pvV1FC6RbPnWc5lLA8Cg');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.an=QbLGiZ2zzVJKeu2xYWgR5IaxKUluOOztOVSmw1oEWCmpelCajjYprL6HoyasHilD');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.khADDtf=CCtX5-uOm9aD59FjhuGhDepHW9Wcg5K03U37O8kkOymAIAMFclklSG7-Rs4LqhIuqSKljStqvPcTV0XwFGKbiw');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('btv3.wAiXPd0=3o5aDo0EpXPZkskcnxcBfoyqk_Ov6hhfrUgvuOSSg35TGj-pI7PgxwDPPZi7La7v');
        this.j.setCookie(cookie, '.yjtag.yahoo.co.jp');
        cookie  = request.cookie('icu=ChgImoUvEAoYCyALKAswi-z2zgU4C0ALSAsQi-z2zgUYCg..');
        this.j.setCookie(cookie, '.adnxs.com');
        cookie  = request.cookie('mbox=check#true#1507702341|session#1507702262467-66680#1507704141');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('s_cc=true');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('s_fid=47B8D5AC5C3B65F4-01FEDFB3D8FFD29F');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('s_pers=%20s_ppn%3Dshp%253Asearch%253Asearch%253Adf%7C1507704082102%3B');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('s_sess=%20eVar56%3Ditem%253EOTHER%253Eitem%253EOTHER%3B%20eVar49%3Dshp%253Asearch%253Asearch%253Adf%253Eshp%253Amain%253Atop%253Eshp%253Asearch%253Asearch%253Adf%253Eshp%253Amain%253Acategory%253Alist%253Eshp%253Asearch%253Asearch%253Adf%3B%20search_suffix%3Ddf%3B%20s_ppvl%3Dshp%25253Asearch%25253Asearch%25253Adf%252C20%252C29%252C1205%252C1346%252C836%252C1920%252C1080%252C1%252CL%3B%20search_result_pos%3Ditem%253Dsearch%257Ctype%253Dk2%257Cdisp%253D30%257Cpg%253D1%257Cpos%253D3%3B%20s_ppv%3Dshp%25253Asearch%25253Asearch%25253Adf%252C21%252C23%252C976%252C1346%252C836%252C1920%252C1080%252C1%252CL%3B');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('s_sq=%5B%5BB%5D%5D');
        this.j.setCookie(cookie, '.shopping.yahoo.co.jp');
        cookie  = request.cookie('sess=1');
        this.j.setCookie(cookie, '.adnxs.com');
        cookie  = request.cookie('trc_cookie_storage=taboola%2520global%253Auser-id%3D467831d3-af48-4a91-86ab-87bec12c628a');
        this.j.setCookie(cookie, 's.yimg.jp');
        cookie  = request.cookie('uuid2=8827466549710254843');
        this.j.setCookie(cookie, '.adnxs.com');

    */
        //   }
        Crawl(url, param, cookies, expressions) {
            //this.count++;
            let jar = request.jar();
            cookies.forEach((entry) => {
                let cookie = request.cookie(entry.cookie);
                jar.setCookie(cookie, entry.domain);
            });
            return new Promise((resolve, reject) => {
                //    setTimeout(() => {
                request({
                    uri: url,
                    method: 'GET',
                    jar: jar
                }, (error, response, body) => {
                    if (!error) {
                        let dom = new JSDOM(body);
                        if (dom) {
                            let window = dom.window;
                            if (window) {
                                wgxpath.install(window);
                                let result = {};
                                let keys = Object.keys(expressions);
                                keys.forEach((key) => {
                                    let expression_for_key = window.document.createExpression(expressions[key]);
                                    result[key] = expression_for_key.evaluate(window.document, wgxpath.XPathResultType.STRING_TYPE).stringValue;
                                });
                                resolve({ param: param, result: result });
                            }
                            else {
                                reject({ code: 1, message: "html error" });
                            }
                        }
                    }
                });
                //      }, 10000 * this.count);
            });
        }
    }
    CrawlerModule.Crawler = Crawler;
})(CrawlerModule = exports.CrawlerModule || (exports.CrawlerModule = {}));
module.exports = CrawlerModule;
//# sourceMappingURL=crawler.js.map