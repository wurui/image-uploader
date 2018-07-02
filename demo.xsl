<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="mod.xsl" />
  <xsl:output method="html" doctype-public="" encoding="UTF-8"/>

  <xsl:template match="/root">
    <html env="{env/domain}">
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
        <title>image-uploader Demo</title>
        <link rel="stylesheet" type="text/css" href="https://a.oxm1.cc/css/ea.css" />
        <link rel="stylesheet" type="text/css" href="../asset/index.css?{generate-id(.)}" />
        <script src="https://l.oxm1.cc/3rd/require.js"></script>
      </head>
      <body>
        <div class="layout">
          <xsl:call-template name="wurui.image-uploader" />
        </div>
        <script><![CDATA[
          require.config({
            urlArgs:Math.random(),
            paths: {
              jquery: 'https://l.oxm1.cc/3rd/jquery',
              zepto: 'https://l.oxm1.cc/3rd/zepto.min',
              mustache: 'https://l.oxm1.cc/3rd/mustache',
              oxjs:'https://a.oxm1.cc/js/oxjs-dev'
            },
            packages:[{name:"oxm",location:'https://a.oxm1.cc/oxm'}]
          });
          require(['zepto','oxjs','../asset/index'],function(undefine,oxjs,Mod){
          Mod && Mod.init && Mod.init($('.J_OXMod'));
          })
        ]]></script>
      </body>

    </html>
  </xsl:template>

</xsl:stylesheet>
