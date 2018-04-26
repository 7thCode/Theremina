
/*
let HtmlDocument  = () => { Prolog Root MiscSequence? };

let Root = () => { ElementHtml };

//     [[2]]  Char ::=  #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
//     [[3]]  S ::= (#x20 | #x9 | #xD | #xA)+
//     [[4]]  NameChar ::=Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
//     [[5]]  Name ::= (Letter | '_' | ':') (NameChar)*
//     QNames data is implemented as categories in order to avoid ambiguous parses,
//     they exist as production in order to get an entry in the wfst - and a constructor
//     Prefix ::= NCName
//     LocalPart ::= NCName

//     QName ::= ( Prefix ':') ? LocalPart
let QName = () => { QNameCharData };
let HtmlGIQName  = () => { HtmlGIQNameCharData };

let Names  = () => { NCName (S Names)? };

let Nmtoken  = () => { NameCharData };
let Nmtokens  = () => { Nmtoken (S Nmtokens)? }
let EntityValue  = () => { ('"' EntityData? '"') | ('\'' EntityData? '\'') };

// EntityValue ::= ('"' EntityChildSequence? '"') | ('\'' EntityChildSequence? '\'')
// EntityChildSequence ::= EntityChild EntityChildSequence?
// EntityChild ::= EntityCharData | PEReference | Reference

let AttValue  = () => { ('"' AttChildSequence? '"' ) | ('\'' AttChildSequence? '\'') };
let AttChildSequence  = () => { AttChild AttChildSequence? }
let AttChild  = () => { AttCharData | Reference | ParsedReference }
let DefaultAttValue  = () => { ('"' DefaultAttChildSequence? '"' ) | ('\'' DefaultAttChildSequence? '\'') }
let DefaultAttChildSequence  = () => { DefaultAttChild DefaultAttChildSequence? }
let DefaultAttChild  = () => { DefaultAttCharData | Reference | ParsedReference }
let SystemLiteral  = () => { ('"' SystemCharData? '"') | ('\'' SystemCharData? '\'') }
let PubidLiteral  = () => { ('"' PubidCharData? '"') | ('\'' PubidCharData? '\'') }
//     [[13]] PubidChar ::= #x20 | #xD | #xA | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]
//     [[14]] CharData ::= [^<&]* - ([^<&]* ']]>' [^<&]*)
let Comment  = () => { '<!--' CommentCharData? '-->' }
//     when data appears, then with a preceeding space. note that just space is ok.
let Pi  = () => { '<?' PiTarget (S PiCharData? )? '?>' }
//     [[17]] PITarget ::= NCName - (('X' | 'x') ('M' | 'm') ('L' | 'l'))
let CDSect  = () => { CDStart CDataCharData? CDEnd }
let CDStart  = () => { '<![CDATA[' }
//     [[20]] CData ::= (Char* - (Char* ']]>' Char*)
let CDEnd  = () => { ']]>' }
let Prolog  = () => { XMLDecl? MiscSequence? DoctypeProlog? }
let DoctypeProlog  = () => { DoctypeDecl MiscSequence? }
let XMLDecl  = () => { '<?xml' VersionInfo EncodingDecl? SDDecl? S* '?>' }
let VersionInfo  = () => { S+ version Eq ( ('"' VersionNumCharData '"') | ('\'' VersionNumCharData '\'') ) }
let Eq  = () => { S* '=' S* }
//     [[26]] VersionNum ::= ([a-zA-Z0-9_.:] | '-')+
let MiscSequence  = () => { Misc MiscSequence? }
let Misc  = () => { Comment | Pi | S+ }
let DoctypeDecl  = () => { '<!DOCTYPE' S+ QName() (S ExternalID)? S* ('[' IntSubsetDecl* ']' S* )? '>' }
    // IntSubsetDeclSequence ::= IntSubsetDecl+
let IntSubsetDecl  = () => { DeclSep | MarkupDecl }
let DeclSep  = () => { S+ | PEReference | ParsedExtSubset }
let MarkupDecl  = () => { ElementDecl | AttlistDecl | EntityDecl | NotationDecl | Pi | Comment }
let ExtSubset  = () => { TextDecl? ExtSubsetDecl* }
    // ExtSubset ::= TextDecl? ExtSubsetDeclSequence?
    // ExtSubsetDeclSequence ::= ExtSubsetDecl ExtSubsetDeclSequence?
    // ExtSubsetDeclSequence ::= ExtSubsetDecl+
let ExtSubsetDecl  = () => { MarkupDecl | ConditionalSect | DeclSep }
let SDDecl  = () => { S+ standalone Eq ( ('"' YesOrNo '"') | ('\'' YesOrNo '\'') ) }
let YesOrNo  = () => { yes | no }
//     [[33]] ... [[38]] ?
let ElementHtml  = () => { HtmlTag | ( STag ( '/>' | ( '>' Content* ETag ) ) ) }
// this formulation overflows the stack for large content. for example, the xml rec
// with reduction disabled generates an 800+ sequence for the character table.
// Element ::= STag ( '/>' | ( '>' ContentSequence? ETag ) )
// ContentSequence ::= Content ContentSequence?
// the original formulation intriduced ambiguity which required unrestricted look-ahead
// over the tag content
// Element ::= EmptyElemTag | ( STag ContentSequence? ETag )
let STag  = () => { '<' QName() AttributeSequence? S* }
let AttributeSequence  = () => { Attribute AttributeSequence? }
    // STag ::= '<' QName() AttributeSequence? S* '>'
let HtmlTag  = () => { '<' HtmlGIQName AttributeSequence? S* '>' }
let Attribute  = () => { S+ QName() Eq AttValue }
let ETag  = () => { '</' QName() S* '>' }
//     in content, try to parse CharData first so that tag parsers are active
//     only once the tag start has been recognized.
let Content  = () => { CharData | ElementHtml | Comment | Pi | CDSect | Reference | ParsedReference }
    // Content ::= CharData | Element | Reference | CDSect | Pi | Comment
    // Element does not now require this
//     [[44]] EmptyElemTag ::= '<' QName AttributeSequence? S* '/>'
let ElementDecl  = () => { '<!ELEMENT' S+ QName() S+ ContentSpec S* '>' }
    //   the content spec is expressed without whitespace since it is stripped there
let ContentSpec  = () => { EMPTY | ANY | Mixed | Children }
    // rewritten to eliminate otherwise unbounded look-ahead
let Children ::= ChoiceOrSeq Cardinality? }
let Cp ::= ( QName() | ChoiceOrSeq ) Cardinality? }
let ChoiceOrSeq  = () => { '(' S* Cp ( Choice | Seq )? S* ')' }
let Choice  = () => { ( S* '|' S* Cp )+ }
let Seq     = () => { ( S* ',' S* Cp )+ }
    // Children ::= (Choice | Seq) Cardinality?
    // Cp ::= ( QName | Choice | Seq) Cardinality?
    // Choice ::= '(' S* Cp ( S* '|' S* Cp )+ S* ')'
    // Seq    ::= '(' S* Cp ( S* ',' S* Cp )* S* ')'
let Mixed  = () => { ( '(' S* PCDATA ( S* '|' S* QName() )* S* ')' MixedCardinality ) | ( '(' S* PCDATA S* ')' ) }
let Cardinality  = () => {'?' | '+' | '*' }
let MixedCardinality  = () => { '*' }
let AttlistDecl  = () => { '<!ATTLIST' S+ QName() AttDefSequence? S* '>' }
let AttDefSequence  = () => { AttDef AttDefSequence? }
let AttDef  = () => { S+ QName() S+ AttType S+ DefaultDecl }
let AttType  = () => { StringType | TokenizedType | EnumeratedType }
let StringType  = () => { CDATA }
let TokenizedType  = () => { ID | IDREF | IDREFS | ENTITY | ENTITIES | NMTOKEN | NMTOKENS }
let EnumeratedType  = () => { NotationType | Enumeration }
let NotationType  = () => { NOTATION S+ '(' S* NotationTypeSequence S* ')' }
let NotationTypeSequence  = () => { NCName (S*  '|' S* NotationTypeSequence )? }
    //     the spec says Nmtoken, but the conformance tests say character sequence
    //     Enumeration ::= '(' Nmtoken ( '|' Nmtoken)* ')'
let Enumeration  = () => { '(' EnumerationSequence S* ')' }
let EnumerationSequence  = () => { S* Nmtoken ( S* '|' EnumerationSequence )? }
let DefaultDecl ::= REQUIRED | IMPLIED | (( FIXED S)? DefaultAttValue) }
let ConditionalSect  = () => { IncludeSect | IgnoreSect | NamedConditionalSect }
    // ConditionalSect ::= IncludeSect | IgnoreSect
let IncludeSect  = () => { '<![' S* INCLUDE S* '[' ExtSubsetDecl* ']]>' }
    // IncludeSect ::= '<![' S* INCLUDE S* '[' ExtSubsetDecl* ']]>'
let IgnoreSect  = () => { '<![' S* IGNORE S* '[' IgnoreSectContents? ']]>' }
let IgnoreSectContents  = () => { Ignore IgnoreSectContents? }
let gnore ::= IgnoreCData |  ('<![' IgnoreSectContents? ']]>' ) }
let NamedConditionalSect  = () => { '<![' S* PEReference S* '[' ExtSubsetDecl* ']]>' }
//     NamedConditionalSect ::= '<![' S* PEReference S* '[' ExtSubsetDecl* ']]>'
let CharRef  = () => { ('&#' Number ';') | ( '&#x' HexNumber ';' ) }
let Reference  = () => { EntityRef | CharRef }
let EntityRef  = () => { '&' NCName ';' }
let PEReference  = () => { '%' NCName ';' }
let EntityDecl  = () => { '<!ENTITY' S+ ( GEDecl | PEDecl ) }
//     EntityDecl ::= GEDecl | PEDecl
let GEDecl  = () => { NCName S+ EntityDef S* '>' }
//     GEDecl ::= '<!ENTITY' S+ NCName S+ EntityDef S* '>'
let PEDecl  = () => { '%' S+ NCName S+ PEDef S* '>' }
    // PEDecl ::= '<!ENTITY' S+ '%' S+ NCName S+ PEDef S* '>'
let EntityDef  = () => { EntityValue | (ExternalID NDataDecl?) }
let PEDef  = () => { EntityValue | ExternalID }
let ExternalID  = () => { ( SYSTEM S+ SystemLiteral ) | ( PUBLIC S+ PubidLiteral S+ SystemLiteral ) }
let NDataDecl  = () => {  S+ NDATA S+ NCName }
let TextDecl  = () => { '<?xml' VersionInfo? EncodingDecl S* '?>' }
let ExtParsedEnt  = () => { TextDecl? Content* }
    //     [[79]]  eliminated ExtPE ::= TextDecl? ExtSubsetDecl*
let EncodingDecl  = () => {  S+ encoding Eq ( ('"' EncNameCharData '"') | ( '\'' EncNameCharData '\'' ) ) }
//     [[81]] EncName ::= [A-Za-z] ([A-Za-z0-9._] | '-')*
let NotationDecl  = () => { '<!NOTATION'  S+ NCName S+ PublicID S* '>' }
//     NotationDecl ::= '<!NOTATION'  S+ NCName S+ (ExternalID |  PublicID) S* '>'
let PublicID   = () => { ( SYSTEM S+ SystemLiteral ) | ( PUBLIC S+ PubidLiteral (S+ SystemLiteral)? ) }
//     PublicID ::= PUBLIC S+ PubidLiteral
*/


/*

let HtmlDocument  = () => { SEQ([Prolog(), Root(), COND(MiscSequence())]) };

let Root = () => { ElementHtml() };


let IS = (a,b) =>  {};
let M1 = (a) => {};  //1回以上の繰り返し
let M0 = (a) => {};　//0回以上の繰り返し

let OR =(a) => {};
let SEQ = (a) => {};
let COND =(a) => {};  // 有無




/////////
let NCName = () => {};
let QNameCharData= () => {};
let HtmlGIQNameCharData = () => {};
let EntityData = () =>  {};
let NameCharData = () =>  {};
let AttCharData = () =>  {};
let ParsedReference = () =>  {};
let DefaultAttCharData = () =>  {};
let SystemCharData = () =>  {};
let PubidCharData = () =>  {};
let CommentCharData = () => {};
let PiTarget = () => {};
let PiCharData = () => {};
let version = () => {};
let VersionNumCharData = () => {};
let ParsedExtSubset = () => {};
let standalone = () => {};
let yes = () => {};
let no = () => {};
let CharData = () => {};
let EMPTY = () => {};
let ANY = () => {};
let PCDATA = () => {};
let CDATA = () => {};
let ID = () => {};
let IDREF = () => {};
let IDREFS = () => {};
let ENTITY = () => {};
let ENTITIES = () => {};
let NMTOKEN = () => {};
let NMTOKENS = () => {};
let NOTATION = () => {};
let IMPLIED = () => {};
let INCLUDE = () => {};
let IGNORE = () => {};
let IgnoreCData = () => {};
let SYSTEM = () => {};
let encoding  = () => {};
let HexNumber = () => {};
let EncNameCharData = () => {};

//     [[2]]  Char ::=  #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
//     [[3]]  S ::= (#x20 | #x9 | #xD | #xA)+
//     [[4]]  NameChar ::=Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
//     [[5]]  Name ::= (Letter | '_' | ':') (NameChar)*
//     QNames data is implemented as categories in order to avoid ambiguous parses,
//     they exist as production in order to get an entry in the wfst - and a constructor

let S = (s) => { return M1([OR([ IS(s,#x20), IS(s,#x9), IS(s,#xD), IS(s,#xA)])]) };
let Prefix = (s) => { return NCName(s) };
let LocalPart = (s) => { return NCName(s) };

let QName = (s) => { return SEQ([COND(SEQ([ Prefix(s), IS(s,':')])), LocalPart(s)]) };

//let QName = () => { return  QNameCharData() };
let HtmlGIQName  = (s) => { return  HtmlGIQNameCharData(s) };

let Names  = (s) => { return SEQ([NCName(s), COND(SEQ([S(s), Names(s)]))]); };

let Nmtoken  = (s) => { return NameCharData() };
let Nmtokens  = (s) => { return  SEQ([Nmtoken(s), COND(SEQ([S(s), Nmtokens(s)]))]) };
let EntityValue  = (s) => { return  OR([SEQ([IS(s,'"'), COND(EntityData()), IS(s,'"')]) , SEQ([IS(s,'\''), COND(EntityData(s)), IS(s,'\'')])]) };


let AttValue  = (s) => { return  OR([SEQ([IS(s,'"'), COND(AttChildSequence(s)), IS(s,'"')]) , SEQ([IS(s,'\''), COND(AttChildSequence(s)), IS(s,'\'')])]) };
let AttChildSequence  = (s) => { return  SEQ([AttChild(s), COND(AttChildSequence(s))]) };
let AttChild  = (s) => { return  OR([AttCharData(s) , Reference(s), ParsedReference(s)]) };
let DefaultAttValue  = (s) => { return  OR([SEQ([IS(s,'"'), COND(DefaultAttChildSequence(s)), IS(s,'"') ]) , SEQ([IS(s,'\''), COND(DefaultAttChildSequence(s)), IS(s,'\'')])]) };
let DefaultAttChildSequence  = (s) => { return  SEQ([DefaultAttChild(), COND(DefaultAttChildSequence())]) };
let DefaultAttChild  = (s) => { return  OR([DefaultAttCharData() , Reference() , ParsedReference()]) };
let SystemLiteral  = (s) => { return  OR([SEQ([IS('"'), COND(SystemCharData()), IS('"')]) , SEQ([IS('\''), COND(SystemCharData()), IS('\'')])]) };
let PubidLiteral  = (s) => { return  OR([SEQ([IS(s,'"'), COND(PubidCharData()), IS(s,'"')]) , SEQ([IS('\''), COND(PubidCharData()), IS('\'')])]) };

let Comment  = (s) => { return SEQ([IS(s,'<!--'), COND(CommentCharData(s)), IS(s,'-->')]) };

let Pi  = (s) => { return  SEQ([IS(s,'<?'), PiTarget(s), COND(SEQ([S(s), COND(PiCharData(s))])), IS(s,'?>')]) };

let CDSect  = (s) => { return  SEQ([CDStart(s), COND(CDataCharData(s)), CDEnd(s)]) };
let CDStart  = (s) => { return  IS(s,'<![CDATA[') };
let CDEnd  = (s) => { return  IS(s,']]>') };
let Prolog  = (s) => { return  SEQ([COND(XMLDecl(s)), COND(MiscSequence(s)), COND(DoctypeProlog(s))]) };
let DoctypeProlog  = (s) => { return  SEQ([DoctypeDecl(), COND(MiscSequence)]) };
let XMLDecl  = (s) => { return  SEQ([IS(s,'<?xml'), VersionInfo(s), COND(EncodingDecl(s)), COND(SDDecl(s)), M0(S(s)), IS(s,'?>')]) };
let VersionInfo  = (s) => { return  SEQ([M1(S(s)), version(), Eq(s), OR([ SEQ([IS(s,'"'), VersionNumCharData(), IS(s,'"')]) , SEQ([IS('\''), VersionNumCharData(), IS('\'')])])])  };
let Eq  = (s) => { return  SEQ([M0(S()), IS(s,'='), M0(S(s))]) };

let MiscSequence  = (s) => { return  SEQ([Misc(s), COND(MiscSequence(s))]) };
let Misc  = (s) => { return  OR([Comment(s), Pi(s) , M1(S(s))]) };
let DoctypeDecl  = (s) => { return  SEQ([IS(s,'<!DOCTYPE'), M1(S(s)), QName(s), COND(SEQ([S(), ExternalID(s)])), M0(S(s)), COND(SEQ([IS(s,'['), M0(IntSubsetDecl()), IS(']'), M0(S())])), IS('>')]) };

let IntSubsetDecl  = (s) => { return  OR([DeclSep(s) , MarkupDecl(s)]) };
let DeclSep  = (s) => { return  OR([M1(S()) , PEReference(s) , ParsedExtSubset(s)]) };
let MarkupDecl  = (s) => { return  OR([ ElementDecl(s) , AttlistDecl(s) , EntityDecl(s) , NotationDecl(s) , Pi(s) , Comment(s) ]) };
let ExtSubset  = (s) => { return  SEQ([M1(TextDecl()), M0(ExtSubsetDecl())]) };

let ExtSubsetDecl  = (s) => { return  OR([MarkupDecl() , ConditionalSect() , DeclSep()]) };
let SDDecl  = (s) => { return  SEQ([M1(S()), standalone(), Eq() , OR([SEQ([IS('"'), YesOrNo(), IS('"')]) , SEQ([IS('\''), YesOrNo(), IS('\'')])])])  };
let YesOrNo  = (s) => { return  OR([yes() , no()]) };

let ElementHtml  = (s) => { return  OR([HtmlTag , SEQ([STag(), OR([ IS('/>') , SEQ([ IS('>'), M0(Content()), ETag() ])]) ] )]) };

let STag  = (s) => { return  SEQ([IS('<'), QName(), COND(AttributeSequence()), M0(S())]) };
let AttributeSequence  = (s) => { return  SEQ([Attribute(), COND(AttributeSequence())]) };
let HtmlTag  = (s) => { return  SEQ([IS('<'), HtmlGIQName(), COND(AttributeSequence()), M0(S()), IS('>')]) };
let Attribute  = (s) => { return  SEQ([M1(S()), QName(), Eq(), AttValue()]) };
let ETag  = (s) => { return  SEQ([IS('</'), QName(), M0(S()), IS('>')]) };
let Content  = (s) => { return  OR([ CharData() , ElementHtml() , Comment() , Pi() , CDSect() , Reference() , ParsedReference() ]) };
let ElementDecl  = (s) => { return  SEQ([ IS('<!ELEMENT'), M1(S()), QName(), M1(S()), ContentSpec(), M0(S()), IS('>')]) };
let ContentSpec  = (s) => { return  OR([EMPTY() , ANY() , Mixed(),  Children()]) };
let Children  = (s) => { return  SEQ([ChoiceOrSeq(), COND(Cardinality())]) };
let Cp  = (s) => { return  SEQ([ OR([QName() , ChoiceOrSeq]),  COND(Cardinality())]) };
let ChoiceOrSeq  = (s) => { return  SEQ([IS('('), M0(S()), Cp(), COND(OR([Choice() , Seq()])), M0(S()), IS(')')]) };
let Choice  = (s) => { return  M1(SEQ([ M0(S()), IS('|'), M0(S()), Cp()]) ) };
let Seq     = (s) => { return  M1(SEQ([ M0(S()), IS(','), M0(S()), Cp()]) ) };
let Mixed  = (s) => { return  OR([SEQ([IS('('), M0(S()), PCDATA(), M0([ M0(S()), IS('|'), M0(S()), QName() ]), M0(S()), IS(')'), MixedCardinality() ]) , ( IS('(') M0(S()) PCDATA M0(S()) IS(')') )]) }
let Cardinality  = (s) => { return  OR([IS('?') , IS('+') , IS('*')]) };
let MixedCardinality  = (s) => { return  IS('*') };
let AttlistDecl  = (s) => { return  SEQ([IS('<!ATTLIST'), M1(S()), QName(), COND(AttDefSequence()), M0(S()), IS('>')]) };
let AttDefSequence  = (s) => { return SEQ([AttDef(), COND(AttDefSequence())]) };
let AttDef  = (s) => { return SEQ([M1(S()), QName(), M1(S()), AttType(), M1(S()), DefaultDecl()]) };
let AttType  = (s) => { return OR([StringType() , TokenizedType() , EnumeratedType()]) };
let StringType  = (s) => { return CDATA() };
let TokenizedType  = (s) => { return OR([ID() , IDREF() , IDREFS() , ENTITY() , ENTITIES() , NMTOKEN() , NMTOKENS()]) };
let EnumeratedType  = (s) => { return OR([NotationType() , Enumeration()]) };
let NotationType  = (s) => { return SEQ([NOTATION(), M1(S()), IS('('), M0(S()), NotationTypeSequence(), M0(S()), IS(')')]) };
let NotationTypeSequence  = (s) => { return SEQ([NCName(), COND(SEQ([M0(S()),  IS('|'), M0(S()), NotationTypeSequence()]) )]) };

let Enumeration  = (s) => { return SEQ([IS('('), EnumerationSequence(), M0(S()), IS(')')]) };
let EnumerationSequence  = (s) => { SEQ([M0(S()), Nmtoken(), COND(SEQ([ M0(S()), IS('|'), EnumerationSequence() ]))]) };
let DefaultDecl = (s) => { return OR([REQUIRED() , IMPLIED() , SEQ([COND(SEQ([ FIXED(), S()])), DefaultAttValue()])]) };
let ConditionalSect  = (s) => { return OR([IncludeSect() , IgnoreSect() , NamedConditionalSect()]) };

let IncludeSect  = (s) => { return SEQ([IS('<!['), M0(S()), INCLUDE(), M0(S()), IS('['), M0(ExtSubsetDecl()), IS(']]>')]) };

let IgnoreSect  = (s) => { return SEQ([IS('<!['), M0(S()), IGNORE(), M0(S()), IS('['), COND(IgnoreSectContents()), IS(']]>')]) };
let IgnoreSectContents  = (s) => { return SEQ([Ignore(), COND(IgnoreSectContents())]) };
let Ignore = (s) => { return OR([IgnoreCData() ,  SEQ([ IS('<!['), COND(IgnoreSectContents()), IS(']]>') ])]) };
let NamedConditionalSect  = (s) => { return SEQ([IS('<!['), M0(S()), PEReference(), M0(S()), IS('['), M0(ExtSubsetDecl()), IS(']]>')]) };

let CharRef  = (s) => { return OR([SEQ([IS('&#'), Number(), IS(';')]) , SEQ([ IS('&#x'), HexNumber(), IS(';') ])]) };
let Reference  = (s) => { return OR([EntityRef , CharRef]) };
let EntityRef  = (s) => { return SEQ([IS('&'), NCName(), IS(';')]) };
let PEReference  = (s) => { return SEQ([IS('%'), NCName(), IS(';')]) };
let EntityDecl  = (s) => { return SEQ([IS('<!ENTITY'), M1(S()),  OR([GEDecl() , PEDecl()])])  };

let GEDecl  = (s) => { return SEQ([NCName(), M1(S()), EntityDef(), M0(S()), IS('>')]) };

let PEDecl  = (s) => { return SEQ([IS('%'), M1(S()), NCName(), M1(S()), PEDef(), M0(S()), IS('>')]) };

let EntityDef  = (s) => { return OR([EntityValue() , SEQ([ExternalID(), COND(NDataDecl())])]) };
let PEDef  = (s) => { return OR([EntityValue() , ExternalID()]) };
let ExternalID  = (s) => {return OR([SEQ([ SYSTEM(), M1(S()), SystemLiteral() ]) , SEQ([ PUBLIC(), M1(S()), PubidLiteral(), M1(S()), SystemLiteral() ])]) };
let NDataDecl  = (s) => { return SEQ([ M1(S()), NDATA(), M1(S()), NCName() ])};
let TextDecl  = (s) => { return SEQ([IS('<?xml'), COND(VersionInfo()), EncodingDecl(), M0(S()), IS('?>')]) };
let ExtParsedEnt  = (s) => { return SEQ([COND(TextDecl()), M0(Content())]) };

let EncodingDecl  = (s) => { return SEQ([ M1(S()), encoding(), Eq(), OR([ SEQ([IS('"'), EncNameCharData(), IS('"')]) , SEQ( [IS('\''), EncNameCharData(), IS('\'') ])]) ]) };

let NotationDecl  = (s) => { return SEQ([IS('<!NOTATION'),  M1(S()), NCName(), M1(S()), PublicID(), M0(S()), IS('>')]) };

let PublicID   = (s) => { return OR([SEQ([ SYSTEM(), M1(S()), SystemLiteral() ]) , SEQ([ PUBLIC(), M1(S()), PubidLiteral(), COND(SEQ([M1(S()), SystemLiteral()])) ])]) };
*/