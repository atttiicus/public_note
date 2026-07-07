---
title: HTML
description: HTML 是网页使用的语言，定义了网页的结构和内容。
tags: ['WEB前端', 'HTML']
---

## `<colgroup>`、`<col>`

`<colgroup>` 是 `<table>` 的一级子元素，用来包含一组列的定义。`<col>` 是 `<colgroup>` 的子元素，用来定义表格的一列：

```html
<table>
    <colgroup>
        <col />
        <col />
        <col />
    </colgroup>
</table>
```

`<col>` 是单独使用的空元素，没有结束标签，也没有子元素。除了声明表格结构，还可以为表格附加样式：

```html
<table>
    <colgroup>
        <col class="c1" />
        <col class="c2" />
        <col class="c3" />
    </colgroup>
    <tr>
        <td>1</td>
        <td>2</td>
        <td>3</td>
    </tr>
</table>
```

`<col>` 有一个 `span` 属性，值为正整数，默认为 `1`。如果大于 1，表示该列的宽度包含连续的多列：

```html
<table>
    <colgroup>
        <col />
        <col span="2" />
        <col />
    </colgroup>
</table>
```

## `<tr>`

`<tr>` 标签表示表格的一行（table row）。如果表格有 `<thead>`、`<tbody>`、`<tfoot>`，那么 `<tr>` 就放在这些容器元素之中，否则直接放在 `<table>` 的下一级。

## `<th>`、`<td>`

`<th>` 和 `<td>` 都用来定义表格的单元格，其中 `<th>` 是标题单元格，`<td>` 是数据单元格：

```html
<table>
    <tr>
        <th>学号</th>
        <th>姓名</th>
    </tr>
    <tr>
        <td>001</td>
        <td>张三</td>
    </tr>
    <tr>
        <td>002</td>
        <td>李四</td>
    </tr>
</table>
```

**（1）`colspan` 属性、`rowspan` 属性**

单元格跨越多行或多列时，通过 `colspan`（跨列数）和 `rowspan`（跨行数）属性设置，默认值都是 1：

```html
<table>
    <tr>
        <td colspan="2">A</td>
        <td>B</td>
    </tr>
    <tr>
        <td>A</td>
        <td>B</td>
        <td>C</td>
    </tr>
</table>
```

**（2）`headers` 属性**

表格很大时，可以使用 `headers` 属性明确单元格与表头的对应关系：

```html
<table>
    <tr>
        <th id="no">学号</th>
        <th id="names">姓名</th>
    </tr>
    <tr>
        <td headers="no">001</td>
        <td headers="names">张三</td>
    </tr>
    <tr>
        <td headers="no">002</td>
        <td headers="names">李四</td>
    </tr>
</table>
```

`headers` 属性的值对应 `<th>` 标签的 `id` 属性值。由于一个单元格可以对应多个标题栏（跨行的情况），`headers` 属性可以是空格分隔的多个 `id` 值。

**（3）`scope` 属性**

`scope` 属性只有 `<th>` 标签支持，表示该标题单元格到底是行的标题还是列的标题：

```html
<table>
    <tr>
        <th scope="col">姓名</th>
        <th scope="col">学号</th>
        <th scope="col">性别</th>
    </tr>
    <tr>
        <th scope="row">张三</th>
        <td>001</td>
        <td>男</td>
    </tr>
    <tr>
        <th scope="row">李四</th>
        <td>002</td>
        <td>男</td>
    </tr>
</table>
```

`scope` 属性可以取以下值：

- `row`：该行的所有单元格，都与该标题单元格相关。
- `col`：该列的所有单元格，都与该标题单元格相关。
- `rowgroup`：多行组成的行组的所有单元格，都与该标题单元格相关，可与 `rowspan` 配合使用。
- `colgroup`：多列组成的列组的所有单元格，都与该标题单元格相关，可与 `colspan` 配合使用。
- `auto`：默认值，由浏览器自行决定。

下面是一个 `colgroup` 和 `rowgroup` 的示例：

```html
<table>
    <thead>
        <tr>
            <th scope="col">海报名称</th>
            <th scope="col">颜色</th>
            <th colspan="3" scope="colgroup">尺寸</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th rowspan="3" scope="rowgroup">Zodiac</th>
            <th scope="row">Full color</th>
            <td>A2</td>
            <td>A3</td>
            <td>A4</td>
        </tr>
        <tr>
            <th scope="row">Black and white</th>
            <td>A1</td>
            <td>A2</td>
            <td>A3</td>
        </tr>
        <tr>
            <th scope="row">Sepia</th>
            <td>A3</td>
            <td>A4</td>
            <td>A5</td>
        </tr>
    </tbody>
</table>
```

渲染结果如下：

| 海报名称 | 颜色            | 尺寸 |     |     |
| -------- | --------------- | ---- | --- | --- |
| Zodiac   | Full color      | A2   | A3  | A4  |
|          | Black and white | A1   | A2  | A3  |
|          | Sepia           | A3   | A4  | A5  |

# 表单标签

表单（form）是用户输入信息与网页互动的一种形式。大多数情况下，用户提交的信息会发给服务器，比如网站的搜索栏就是表单。

表单由一种或多种小部件组成，比如输入框、按钮、单选框或复选框，这些小部件称为控件（controls）。

## `<form>`

### 简介

`<form>` 标签用来定义一个表单，所有表单内容放到这个容器元素之中：

```html
<form action="https://example.com/api" method="post">
    <label for="POST-name">用户名：</label>
    <input id="POST-name" type="text" name="user" />
    <input type="submit" value="提交" />
</form>
```

上面代码中，用户在文本输入框里输入用户名（比如 `foobar`），点击提交按钮，浏览器就会向服务器 `https://example.com/api` 发送一个 POST 请求，发送 `user=foobar` 这样一段数据。

`<form>` 有以下属性：

- `accept-charset`：服务器接受的字符编码列表，使用空格分隔，默认与网页编码相同。
- `action`：服务器接收数据的 URL。
- `autocomplete`：浏览器是否可以自动填写控件。取值为 `off`（不自动填写）和 `on`（自动填写）。
- `method`：提交数据的 HTTP 方法，可能的值有 `post`（表单数据作为 HTTP 数据体发送）、`get`（表单数据作为 URL 的查询字符串发送）、`dialog`（表单位于 `<dialog>` 内部使用）。
- `enctype`：当 `method` 等于 `post` 时，指定提交给服务器的 MIME 类型。可能的值为 `application/x-www-form-urlencoded`（默认值）、`multipart/form-data`（文件上传的情况）、`text/plain`。
- `name`：表单的名称，应在网页中唯一。注意，如果一个控件没有设置 `name` 属性，该控件的值不会作为键值对向服务器发送。
- `novalidate`：布尔属性，表单提交时是否取消验证。
- `target`：在哪个窗口展示服务器返回的数据，可能的值有 `_self`（当前窗口）、`_blank`（新建窗口）、`_parent`（父窗口）、`_top`（顶层窗口）、`<iframe>` 标签的 `name` 属性值。

### enctype 属性

**（1）`application/x-www-form-urlencoded`**

默认类型。控件名和控件值都要转义（空格转为 `+` 号，非数字和非字母转为 `%HH` 的形式，换行转为 CR LF），控件名和控件值之间用 `=` 分隔，控件之间用 `&` 分隔。

**（2）`multipart/form-data`**

主要用于文件上传。上传大文件时，会将文件分成多块传送，每一块的 HTTP 头信息都有 `Content-Disposition` 属性，值为 `form-data`，以及一个 `name` 属性，值为控件名。

```html
<form action="https://example.com/api" enctype="multipart/form-data" method="post">
    用户名：<input type="text" name="submit-name" /><br />
    文件：<input type="file" name="files" /><br />
    <input type="submit" value="上传" /> <input type="reset" value="清除" />
</form>
```

输入用户名 `Larry`，选中文件 `file1.txt` 后点击"上传"，浏览器发送的实际数据如下：

```http
Content-Type: multipart/form-data; boundary=--AaB03x

--AaB03x
Content-Disposition: form-data; name="submit-name"

Larry
--AaB03x
Content-Disposition: form-data; name="files"; filename="file1.txt"
Content-Type: text/plain

... contents of file1.txt ...
--AaB03x--
```

## `<fieldset>`、`<legend>`

`<fieldset>` 是一个块级容器标签，用于将一组相关控件组合在一起：

```html
<form>
    <fieldset>
        <p>年龄：<input type="text" name="age" /></p>
        <p>性别：<input type="text" name="gender" /></p>
    </fieldset>
</form>
```

`<fieldset>` 有以下属性：

- `disabled`：布尔属性，设置后 `<fieldset>` 内部所有控件都不可用，变成灰色状态。
- `form`：指定控件组所属 `<form>` 的 `id` 属性。
- `name`：该控件组的名称。

`<legend>` 标签用来设置 `<fieldset>` 控件组的标题，通常是 `<fieldset>` 内部的第一个元素，会嵌入显示在控件组的上边框里面：

```html
<fieldset>
    <legend>学生情况登记</legend>
    <p>年龄：<input type="text" name="age" /></p>
    <p>性别：<input type="text" name="gender" /></p>
</fieldset>
```

## `<label>`

`<label>` 是一个行内元素，提供控件的文字说明，帮助用户理解控件的目的：

```html
<label for="user">用户名：</label> <input type="text" name="user" id="user" />
```

`<label>` 的一大优势是增加了控件的可用性。点击 `<label>` 相当于触发控件本身的 `click` 事件，对于单选框等较小的控件尤其有用。

`<label>` 的 `for` 属性关联对应控件，值是对应控件的 `id` 属性。控件也可以直接放在 `<label>` 之中，这时不需要 `for` 属性和 `id` 属性：

```html
<label>用户名：
    <input type="text" name="user" />
</label>
```

`<label>` 的属性如下：

- `for`：关联控件的 `id` 属性。
- `form`：关联表单的 `id` 属性。设置了该属性后，`<label>` 可以放置在页面的任何位置，否则只能放在 `<form>` 内部。

一个控件可以有多个关联的 `<label>` 标签：

```html
<label for="username">用户名：</label>
<input type="text" id="username" name="username" />
<label for="username"><abbr title="required">*</abbr></label>
```

## `<input>`

### 简介

`<input>` 是一个行内元素，用来接收用户的输入。它是单独使用的标签，没有结束标签。

它有多种类型，取决于 `type` 属性的值，默认值是 `text`：

```html
<input />
<!-- 等同于 -->
<input type="text" />
```

所有类型的共同属性如下：

- `autofocus`：布尔属性，是否在页面加载时自动获得焦点。
- `disabled`：布尔属性，是否禁用该控件。一旦设置，该控件将变灰，用户可以看到但无法操作。
- `form`：关联表单的 `id` 属性。设置了该属性后，控件可以放置在页面的任何位置，否则只能放在 `<form>` 内部。
- `list`：关联的 `<datalist>` 的 `id` 属性。
- `name`：控件的名称，主要用于向服务器提交数据时的键名。只有设置了 `name` 属性的控件，才会向服务器提交。
- `readonly`：布尔属性，是否为只读。
- `required`：布尔属性，是否为必填。
- `type`：控件类型。
- `value`：控件的值。

### 类型

**（1）text**

`type="text"` 是普通文本输入框，用来输入单行文本。用户输入换行符时，会自动从输入中删除。

配套属性：`maxlength`、`minlength`、`pattern`（正则表达式验证）、`placeholder`、`readonly`、`size`（显示宽度，字符数）、`spellcheck`。

**（2）search**

`type="search"` 是搜索文本输入框，基本等同于 `type="text"`。某些浏览器会在输入框尾部显示删除按钮，点击后清空所有输入：

```html
<form>
    <input type="search" id="mySearch" name="q" placeholder="输入搜索词……" required />
    <input type="submit" value="搜索" />
</form>
```

**（3）button**

`type="button"` 是没有默认行为的按钮，通常通过脚本指定 `click` 事件的监听函数来使用：

```html
<input type="button" value="点击" />
```

建议尽量不使用这个类型，而使用 `<button>` 标签代替，语义更清晰，且 `<button>` 内部可以插入图片或其他 HTML 代码。

**（4）submit**

`type="submit"` 是表单的提交按钮：

```html
<input type="submit" value="提交" />
```

如果不指定 `value` 属性，浏览器会显示默认文字，通常是 `Submit`。

配套属性（用于覆盖 `<form>` 标签的相应设置）：`formaction`、`formenctype`、`formmethod`、`formnovalidate`、`formtarget`。

**（5）image**

`type="image"` 将一个图像文件作为提交按钮，行为与 `type="submit"` 完全一致：

```html
<input type="image" alt="登陆" src="login-button.png" />
```

用户点击图像按钮提交时，会额外提交两个参数 `x` 和 `y`，表示鼠标点击位置（以图像左上角为原点）。如果设置了 `name` 属性（比如 `name="position"`），则坐标以该值为前缀，如 `position.x=52&position.y=55`。

配套属性：`alt`、`src`、`height`、`width`，以及与 submit 相同的 `formaction` 等属性。

**（6）reset**

`type="reset"` 是重置按钮，点击后所有表单控件重置为初始值：

```html
<input type="reset" value="重置" />
```

该控件用处不大，用户点错后会使所有已输入的值被清除，建议不要使用。

**（7）checkbox**

`type="checkbox"` 是复选框，允许选择或取消选择该选项：

```html
<input type="checkbox" id="agreement" name="agreement" checked />
<label for="agreement">是否同意</label>
```

`value` 属性的默认值是 `on`。如果没有选中，提交时不会包含该项。多个相关的复选框，可以放在 `<fieldset>` 里面：

```html
<fieldset>
    <legend>你的兴趣</legend>
    <div>
        <input type="checkbox" id="coding" name="interest" value="coding" />
        <label for="coding">编码</label>
    </div>
    <div>
        <input type="checkbox" id="music" name="interest" value="music" />
        <label for="music">音乐</label>
    </div>
</fieldset>
```

**（8）radio**

`type="radio"` 是单选框，一组选项中只能选中一项：

```html
<fieldset>
    <legend>性别</legend>
    <div>
        <input type="radio" id="male" name="gender" value="male" />
        <label for="male">男</label>
    </div>
    <div>
        <input type="radio" id="female" name="gender" value="female" />
        <label for="female">女</label>
    </div>
</fieldset>
```

注意，多个单选框的 `name` 属性值应该一致。配套属性：`checked`（是否默认选中）、`value`（默认为 `on`）。

**（9）email**

`type="email"` 是只能输入电子邮箱的文本输入框，提交前浏览器会自动验证格式：

```html
<input type="email" pattern=".+@foobar.com" size="30" required />
```

`multiple` 布尔属性允许输入多个逗号分隔的邮箱地址。注意，同时设置 `multiple` 和 `required` 时，零个邮箱是允许的（即允许为空）。

配套属性：`maxlength`、`minlength`、`multiple`、`pattern`、`placeholder`、`readonly`、`size`、`spellcheck`。

**（10）password**

`type="password"` 是密码输入框，用户输入会被遮挡：

```html
<input type="password" id="pass" name="password" minlength="8" required />
```

浏览器会自动过滤输入内容中的换行符（`U+000A`）和回车符（`U+000D`）。

配套属性：`maxlength`、`minlength`、`pattern`、`placeholder`、`readonly`、`size`、`autocomplete`（`on`/`off`/`current-password`/`new-password`）、`inputmode`。

**（11）file**

`type="file"` 是文件选择框，允许用户选择一个或多个文件：

```html
<input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
```

配套属性：`accept`（允许的文件类型，逗号分隔）、`capture`（图像或视频数据的来源，`user` 或 `environment`）、`multiple`（是否允许选择多个文件）。

**（12）hidden**

`type="hidden"` 是不显示在页面的控件，用于向服务器传递隐藏信息，比如防止 CSRF 攻击的唯一编号：

```html
<input id="prodId" name="prodId" type="hidden" value="xm234jq" />
```

**（13）number**

`type="number"` 是数字输入框，只能输入数字，浏览器通常会显示上下箭头：

```html
<input type="number" id="tentacles" name="tentacles" min="10" max="100" />
```

配套属性：`max`、`min`、`placeholder`、`readonly`、`step`（步长，默认为 1）。

**（14）range**

`type="range"` 是滑块，用户拖动选择给定范围内的一个数值。由于拖动产生的值不精确，如果需要精确数值不建议使用：

```html
<input type="range" id="start" name="volume" min="0" max="11" />
```

配套属性：`max`（默认 100）、`min`（默认 0）、`step`（默认 1）。

与 `<datalist>` 标签配合使用可以在滑动区域产生刻度：

```html
<input type="range" list="tickmarks" />

<datalist id="tickmarks">
    <option value="0" label="0%"></option>
    <option value="10"></option>
    <option value="20"></option>
    <option value="30"></option>
    <option value="40"></option>
    <option value="50" label="50%"></option>
    <option value="60"></option>
    <option value="70"></option>
    <option value="80"></option>
    <option value="90"></option>
    <option value="100" label="100%"></option>
</datalist>
```

**（15）url**

`type="url"` 是只能输入网址的文本框，提交前浏览器会自动检查格式：

```html
<input
    type="url"
    name="url"
    id="url"
    placeholder="https://example.com"
    pattern="https://.*"
    size="30"
    required
/>
```

注意，不带协议的网址是无效的，`foo.com` 无效，`http://foo.com` 有效。

配套属性：`maxlength`、`minlength`、`pattern`、`placeholder`、`readonly`、`size`、`spellcheck`。

**（16）tel**

`type="tel"` 是只能输入电话号码的输入框。由于各国电话号码格式不同，浏览器没有默认验证模式，通常需要自定义验证：

```html
<input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required />
<small>Format: 123-456-7890</small>
```

**（17）color**

`type="color"` 是颜色选择控件，值一律采用 `#rrggbb` 格式：

```html
<input type="color" id="background" name="background" value="#e66465" />
```

如果没有指定 `value` 属性的初始值，默认为 `#000000`（黑色）。

**（18）date**

`type="date"` 是只能输入日期的输入框（年月日，不含时分秒），输入格式是 `YYYY-MM-DD`：

```html
<input type="date" id="start" name="start" value="2018-07-22" min="2018-01-01" max="2018-12-31" />
```

配套属性：`max`、`min`、`step`（步长，单位为天）。

**（19）time**

`type="time"` 是只能输入时间的输入框（时分秒，不含年月日），格式为 `hh:mm` 或 `hh:mm:ss`：

```html
<input type="time" id="appt" name="appt" min="9:00" max="18:00" required />
<small>营业时间上午9点到下午6点</small>
```

配套属性：`max`、`min`、`readonly`、`step`（步长，单位为秒）。

**（20）month**

`type="month"` 是只能输入年份和月份的输入框，格式为 `YYYY-MM`：

```html
<input type="month" id="start" name="start" min="2018-03" value="2018-05" />
```

配套属性：`max`、`min`、`readonly`、`step`（步长，单位为月）。

**（21）week**

`type="week"` 是输入一年中第几周的输入框，格式为 `yyyy-Www`，比如 `2018-W18` 表示 2018 年第 18 周：

```html
<input type="week" name="week" id="camp-week" min="2018-W18" max="2018-W26" required />
```

配套属性：`max`、`min`、`readonly`、`step`（步长，单位为周）。

**（22）datetime-local**

`type="datetime-local"` 是日期时间输入框，让用户输入年月日和时分，格式为 `yyyy-MM-ddThh:mm`。注意，该控件不支持秒：

```html
<input
    type="datetime-local"
    id="meeting-time"
    name="meeting-time"
    value="2018-06-12T19:30"
    min="2018-06-07T00:00"
    max="2018-06-14T00:00"
/>
```

配套属性：`max`、`min`、`step`（步长，单位为秒，默认值是 60）。

## `<button>`

`<button>` 标签生成一个可以点击的按钮，没有默认行为，通常需要用 `type` 属性或脚本指定按钮的功能：

```html
<button>点击</button>
```

`<button>` 内部不仅可以放置文字，还可以放置图像，形成图像按钮：

```html
<button name="search" type="submit"><img src="search.gif" />搜索</button>
```

`<button>` 具有以下属性：

- `autofocus`：布尔属性，网页加载时焦点就在这个按钮上，一个网页只能有一个元素具有此属性。
- `disabled`：布尔属性，按钮不可用，会变灰不可点击。
- `name`：按钮的名称，与 `value` 属性配合，以 `name=value` 的形式随表单提交到服务器。
- `value`：按钮的值，与 `name` 属性配合使用。
- `type`：按钮的类型，可能的值有 `submit`（提交数据给服务器）、`reset`（重置所有控件为初始值）、`button`（没有默认行为，由脚本指定）。
- `form`：指定按钮关联的 `<form>` 表单的 `id`，省略时默认关联父表单。
- `formaction`：数据提交到服务器的目标 URL，会覆盖 `<form>` 的 `action` 属性。
- `formenctype`：数据提交到服务器的编码方式，会覆盖 `<form>` 的 `enctype` 属性。
- `formmethod`：数据提交使用的 HTTP 方法，会覆盖 `<form>` 的 `method` 属性。
- `formnovalidate`：布尔属性，关闭本地验证，会覆盖 `<form>` 的 `novalidate` 属性。
- `formtarget`：展示服务器返回数据的窗口，会覆盖 `<form>` 的 `target` 属性。

## `<select>`

`<select>` 标签用于生成一个下拉菜单：

```html
<label for="pet-select">宠物：</label>
<select id="pet-select" name="pet-select">
    <option value="">--请选择一项--</option>
    <option value="dog">狗</option>
    <option value="cat">猫</option>
    <option value="others">其他</option>
</select>
```

下拉菜单的菜单项由 `<option>` 标签给出，选中的 `<option>` 的 `value` 属性就是 `<select>` 控件发送给服务器的值。

`<option>` 有一个布尔属性 `selected`，设置后表示该项是默认选中的菜单项。

`<select>` 有如下属性：

- `autofocus`：布尔属性，页面加载时是否自动获得焦点。
- `disabled`：布尔属性，是否禁用当前控件。
- `form`：关联表单的 `id` 属性。
- `multiple`：布尔属性，是否可以选择多个菜单项。一旦设置，多数浏览器会显示滚动列表框。
- `name`：控件名。
- `required`：布尔属性，是否为必填控件。
- `size`：设置了 `multiple` 属性时，页面显示时一次可见的行数。

## `<option>`、`<optgroup>`

`<option>` 标签用在 `<select>`、`<optgroup>`、`<datalist>` 里面，表示一个菜单项。

属性如下：

- `disabled`：布尔属性，是否禁用该项。
- `label`：该项的说明，省略则等于该项的文本内容。
- `selected`：布尔属性，是否为默认值。
- `value`：该项提交到服务器的值，省略则等于该项的文本内容。

`<optgroup>` 表示菜单项的分组，通常用在 `<select>` 内部：

```html
<label>宠物：
    <select name="pets" multiple size="4">
        <optgroup label="四条腿的宠物">
            <option value="dog">狗</option>
            <option value="cat">猫</option>
        </optgroup>
        <optgroup label="鸟类">
            <option value="parrot">鹦鹉</option>
            <option value="thrush">画眉</option>
        </optgroup>
    </select>
</label>
```

`<optgroup>` 的属性：

- `disabled`：布尔属性，是否禁用该组。一旦设置，该组所有菜单项都不可选。
- `label`：菜单项分组的标题。

## `<datalist>`

`<datalist>` 是一个容器标签，用于为指定控件提供一组相关数据，通常用于生成输入提示：

```html
<label for="ice-cream-choice">冰淇淋：</label>
<input type="text" list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
    <option value="巧克力"></option>
    <option value="椰子"></option>
    <option value="薄荷"></option>
    <option value="草莓"></option>
    <option value="香草"></option>
</datalist>
```

`<input>` 的 `list` 属性指定关联的 `<datalist>` 的 `id`。用户点击输入框时，会显示下拉菜单，并且会自动匹配已输入的字符缩小可选范围。

`<option>` 在这里可以不需要闭合标签。`<option>` 还可以加入 `label` 属性作为说明文字，Chrome 浏览器会将其显示在 `value` 的下一行：

```html
<datalist id="ide">
    <option value="Brackets" label="by Adobe"></option>
    <option value="Coda" label="by Panic"></option>
</datalist>
```

## `<textarea>`

`<textarea>` 是一个块级元素，用来生成多行的文本框：

```html
<textarea id="story" name="story" rows="5" cols="33">
这是一个很长的故事。
</textarea>
```

该标签有如下属性：

- `autofocus`：布尔属性，是否自动获得焦点。
- `cols`：文本框的宽度，单位为字符，默认值为 20。
- `dir`：文本方向，默认从左到右（`ltr`），也可设为从右到左（`rtl`）或自动（`auto`）。
- `disabled`：布尔属性，是否禁用该控件。
- `form`：关联表单的 `id` 属性。
- `maxlength`：允许输入的最大字符数，未指定则允许无限输入。
- `minlength`：允许输入的最小字符数。
- `name`：控件的名称。
- `placeholder`：输入为空时显示的提示文本。
- `readonly`：布尔属性，控件是否为只读。
- `required`：布尔属性，控件是否为必填。
- `rows`：文本框的高度，单位为行。
- `spellcheck`：是否打开拼写检查，可能的值有 `true`（打开）、`default`（由父元素或网页设置决定）、`false`（关闭）。
- `wrap`：输入的文本是否自动换行。`hard`（浏览器自动插入换行符 `CR + LF`，使每行不超过控件宽度）、`soft`（超过宽度时自动换行但不加入新换行符，这是默认值）、`off`（关闭自动换行，单行超过宽度时出现水平滚动条）。

## `<output>`

`<output>` 是一个行内元素，用于显示用户操作的结果：

```html
<input type="number" name="a" value="10" /> + <input type="number" name="b" value="10" /> =
<output name="result">20</output>
```

属性如下：

- `for`：关联控件的 `id` 属性，表示为该控件的操作结果。
- `form`：关联表单的 `id` 属性。
- `name`：控件的名称。

## `<progress>`

`<progress>` 是一个行内元素，表示任务的完成进度，浏览器通常将其显示为进度条：

```html
<progress id="file" max="100" value="70">70%</progress>
```

属性如下：

- `max`：进度条的最大值，应该是大于 `0` 的浮点数，默认值为 1。
- `value`：进度条的当前值，必须是 `0` 和 `max` 之间的有效浮点数。省略 `value` 属性时，进度条会出现滚动效果，表示进行中但进度未知。

## `<meter>`

`<meter>` 是一个行内元素，表示已知范围内的一个值，适用于任务进度、磁盘已用空间、充电量等带比例性质的场合。浏览器通常将其显示为不会滚动的指示条：

```html
<p>烤箱的当前温度是<meter min="200" max="500" value="350">350 度</meter>。</p>
```

注意，`<meter>` 元素的子元素正常情况下不会显示，只有浏览器不支持 `<meter>` 时才会显示。

属性如下：

- `min`：范围的下限，必须小于 `max`，默认为 `0`。
- `max`：范围的上限，必须大于 `min`，默认为 `1`。
- `value`：当前值，必须在 `min` 和 `max` 之间，默认为 `0`。
- `low`：表示"低端"的上限门槛值，必须大于 `min`，小于 `high` 和 `max`，省略则等于 `min`。
- `high`：表示"高端"的下限门槛值，必须小于 `max`，大于 `low` 和 `min`，省略则等于 `max`。
- `optimum`：最佳值，必须在 `min` 和 `max` 之间。与 `low`、`high` 配合使用：小于 `low` 则"低端"是最佳范围，大于 `high` 则"高端"是最佳范围，在 `low` 和 `high` 之间则"中间地带"是最佳范围。省略则等于 `min` 和 `max` 的中间值。
- `form`：关联表单的 `id` 属性。

Chrome 浏览器使用三种颜色显示指示条：较好情况显示绿色，一般情况显示黄色，较差情况显示红色：

```html
<meter id="fuel" name="fuel" min="0" max="100" low="33" high="66" optimum="80" value="50">
    at 50/100
</meter>
```

上面代码中，指示条分成三段：0～32、33～65、66～100。由于 `optimum` 是 80，66～100 是较好情况，33～65 是一般情况，0～32 是较差情况。浏览器会根据 `value` 属性显示不同颜色：小于 33 显示红色，大于 65 显示绿色，两者之间显示黄色。

# 其他标签

本章介绍一些较新引入标准的标签。

## `<dialog>`

### 基本用法

`<dialog>` 标签表示一个可以关闭的对话框：

```html
<dialog>Hello world</dialog>
```

默认情况下，对话框是隐藏的，不会在网页上显示。要让对话框显示，必须加上 `open` 属性：

```html
<dialog open>Hello world</dialog>
```

`<dialog>` 元素里面可以放入其他 HTML 元素：

```html
<dialog open>
    <form method="dialog">
        <input type="text" />
        <button type="submit" value="foo">提交</button>
    </form>
</dialog>
```

注意，上例中 `<form>` 的 `method` 属性设为 `dialog`，点击提交按钮后对话框会消失，但表单不会提交到服务器。浏览器会将表单元素的 `returnValue` 属性设为提交按钮的 `value` 属性值（上例是 `foo`）。

### JavaScript API

`<dialog>` 元素的 JavaScript API 提供 `Dialog.showModal()` 和 `Dialog.close()` 两个方法：

```javascript
const modal = document.querySelector('dialog')

// 对话框显示，相当于增加 open 属性
modal.showModal()

// 对话框关闭，相当于移除 open 属性
modal.close()
```

`Dialog.close()` 方法可以接受一个字符串参数，用于传递信息。`<dialog>` 接口的 `returnValue` 属性可以读取这个字符串：

```javascript
modal.close('Accepted')
modal.returnValue // "Accepted"
```

`Dialog.showModal()` 唤起对话框时，会有一个透明层阻止用户与对话框外部的内容互动。CSS 提供了 `::backdrop` 伪类用于选中这个透明层：

```css
dialog {
    padding: 0;
    border: 0;
    border-radius: 0.6rem;
    box-shadow: 0 0 1em black;
}

dialog::backdrop {
    /* make the backdrop a semi-transparent black */
    background-color: rgba(0, 0, 0, 0.4);
}
```

`<dialog>` 元素还有一个 `Dialog.show()` 方法，也能唤起对话框，但没有透明层，用户可以与对话框外部的内容互动。

### 事件

`<dialog>` 元素有两个事件可以监听：

- `close`：对话框关闭时触发。
- `cancel`：用户按下 `Esc` 键关闭对话框时触发。

如果希望用户点击透明层就关闭对话框，可以用下面的代码：

```javascript
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close('cancelled')
    }
})
```

## `<details>`、`<summary>`

### 基本用法

`<details>` 标签用来折叠内容，浏览器会折叠显示该标签的内容：

```html
<details>这是一段解释文本。</details>
```

上面代码在浏览器里面会折叠显示 `Details`，前面有一个三角形：

```
▶ Details
```

用户点击后，折叠的文本会展开：

```
▼ Details 这是一段解释文本。
```

`<details>` 标签的 `open` 属性用于默认打开折叠：

```html
<details open>这是一段解释文本。</details>
```

`<summary>` 标签用来定制折叠内容的标题：

```html
<details>
    <summary>这是标题</summary>
    这是一段解释文本。
</details>
```

通过 CSS 设置 `summary::-webkit-details-marker`，可以改变标题前面的三角箭头：

```css
summary::-webkit-details-marker {
    background: url(https://example.com/foo.svg);
    color: transparent;
}
```

下面是另一种替换箭头的方法：

```css
summary::-webkit-details-marker {
    display: none;
}
summary:before {
    content: '\2714';
    color: #696f7c;
    margin-right: 5px;
}
```

### JavaScript API

`Details` 元素的 `open` 属性返回 `<details>` 当前是打开还是关闭：

```javascript
const details = document.querySelector('details')

if (detail.open === true) {
    // 展开状态
} else {
    // 折叠状态
}
```

`Details` 元素有一个 `toggle` 事件，打开或关闭折叠时都会触发：

```javascript
details.addEventListener('toggle', (event) => {
    if (details.open) {
        /* 展开状态 */
    } else {
        /* 折叠状态 */
    }
})
```
