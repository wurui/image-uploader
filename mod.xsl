<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">

    <xsl:template match="/root" name="wurui.image-uploader">
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-image-uploader" ox-mod="image-uploader" data-uid="{login/uid}">

            <h2>
                This is mod image-uploader demo<br/>
            </h2>
            <div class="imgupload-combo">
                <label class="input-file-trigger" for="{generate-id(.)}">
                    <xsl:value-of select="label"/>
                </label>
                <input id="{generate-id(.)}" style="position:fixed;left:-9999px;top:-9999px;"
                       name="file" type="file"/>
            </div>
            <button class="J_submit">Submit</button>
            <br/>
            <h3>Notice</h3>
            <ol>
                <li>
                    PNG -> JPEG
                </li>
            </ol>
        </div>
    </xsl:template>

</xsl:stylesheet>
