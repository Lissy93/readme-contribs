<h1 align="center">Readme Contribs</h1>
<p align="center"><i>Simple embeddable contributor and sponsor widgets for your GitHub README</i></p>
<p align="center">
  <a href="https://readme-contribs.as93.net/">
    🌐 <b>readme-contribs.as93.net</b><br><br>
    <img width="100" src="https://github.com/Lissy93/readme-contribs/blob/main/public/favicon.png?raw=true" />
  </a>
</p>


## Usage

### Embedding
To embed the image in your markdown, simply use the endpoint as the image URL.<br />
For example:

```
![Contributors](https://readme-contribs.as93.net/contributors/lissy93)
```

### Base Domain
The following API routes are to be made from the base domain.<br />
For the public instance, use `https://readme-contribs.as93.net`.<br />
If you're hosting your own instance, update this to your domain.<br />

### Embed Contributors

```
/contributors/[user]/[repo]
```


### Embed Sponsors

```
/sponsors/[user]
```


### Embed Stargazers

```
/stargazers/[user]/[repo]
```


### Embed Forkers

```
/sponsors/[user]/[repo]
```

### Image Options

You can customize the outputed image, it's appearence and functionality with the following options. <br />
Specify these as query string parameters, appended to the end of your GET request. All values are optional.

| Parameter       | Description                                   | Type    | Default Value                      |
|-----------------|-----------------------------------------------|---------|------------------------------------|
| `title`         | The title to be displayed above the widget    | String  | `''` (Empty string = no title)     |
| `avatarSize`    | Minimum size of avatars                       | Integer | `50`                               |
| `perRow`        | Maximum number of avatars per row             | Integer | `8`                                |
| `shape`         | Shape of the avatar images                    | String  | `square`                           |
| `hideLabel`     | Whether to hide labels                        | Boolean | `false`                            |
| `fontSize`      | Font size for text                            | Integer | `12`                               |
| `textColor`     | Color of the text                             | String  | `333333` (exclude the `#`)         |
| `backgroundColor`| Background color of the widget               | String  | `transparent`                      |
| `fontFamily`    | Font family for the text                      | String  | `'Mona Sans', Verdana sans-serif`  |
| `margin`        | Margin around each avatar                     | Integer | `20`                               |
| `textOffset`    | Offset for text alignment                     | Integer | `20`                               |
| `limit`         | Maximum number of items to display            | Integer | `100`                              |
| `dynamic`       | If true, enables dynamic loading              | Boolean | `false`                            |
| `isResponsive`  | If true, makes the widget responsive          | Boolean | `false`                            |

---

## Deploying your Own

If you plan to use this at any kind of scale, it is highly reccomended to deploy your own instance.

Don't worry, it's super quick, easy and free!

1. Fork this repository
2. Login / Sign up to Vercel
3. Create a new app, and select your newly forked repo
4. Create a GitHub API token [here](https://github.com/settings/tokens?type=beta)
5. Add the `GITHUB_TOKEN` environmental variable into Vercel
6. Hit deploy!

---

## Developing

You can run readme-contribs locally, to make and preview any changes

1. Get the code: `git clone git@github.com:Lissy93/readme-contribs.git`
2. Navigate into the directory: `cd readme-contribs`
3. Install dependencies: `yarn` (or `npn install`)
4. Start the development server: `yarn start`
5. Then open the running app at `localhost:3000`

Don't forget to add your token in the `GITHUB_TOKEN` environmental variable (or put it in `.env`)

---

## Web Interface
If you're finding constructing the URL, and previewing the different options tricky, you can use our web interface to build your embedable card.

Visit [readme-contribs.as93.net](https://readme-contribs.as93.net/) to get started.

<p align="center"><a href="https://readme-contribs.as93.net"><img width="800" src="https://github.com/Lissy93/readme-contribs/assets/1862727/01dc1664-e78e-449b-bb9d-76a92c4487b6" /></a></p>

---

## Examples

---

## Credits

### Contributors

### Sponsors

---

## License

> _**[Lissy93/README-Contribs](https://github.com/Lissy93/readme-contribs)** is licensed under [MIT](https://github.com/Lissy93/readme-contribs/blob/HEAD/LICENSE) © [Alicia Sykes](https://aliciasykes.com) 2024._<br>
> <sup align="right">For information, see <a href="https://tldrlegal.com/license/mit-license">TLDR Legal > MIT</a></sup>

<details>
<summary>Expand License</summary>

```
The MIT License (MIT)
Copyright (c) Alicia Sykes <alicia@omg.com> 

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sub-license, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished 
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included install 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANT ABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

</details>

<!-- License + Copyright -->
<p  align="center">
  <i>© <a href="https://aliciasykes.com">Alicia Sykes</a> 2024</i><br>
  <i>Licensed under <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17">MIT</a></i><br>
  <a href="https://github.com/lissy93"><img src="https://i.ibb.co/4KtpYxb/octocat-clean-mini.png" /></a><br>
  <sup>Thanks for visiting :)</sup>
</p>

<!-- Dinosaur -->
<!-- 
                        . - ~ ~ ~ - .
      ..     _      .-~               ~-.
     //|     \ `..~                      `.
    || |      }  }              /       \  \
(\   \\ \~^..'                 |         }  \
 \`.-~  o      /       }       |        /    \
 (__          |       /        |       /      `.
  `- - ~ ~ -._|      /_ - ~ ~ ^|      /- _      `.
              |     /          |     /     ~-.     ~- _
              |_____|          |_____|         ~ - . _ _~_-_
-->




i 
