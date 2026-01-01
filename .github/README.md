<h1 align="center">Readme Contribs</h1>
<p align="center"><i>Simple embeddable contributor and sponsor widgets for your GitHub README</i></p>
<p align="center">
  <a href="https://readme-contribs.as93.net/">
    🌐 <b>readme-contribs.as93.net</b><br><br>
    <img width="100" src="https://github.com/Lissy93/readme-contribs/blob/main/public/favicon.png?raw=true" />
  </a>
</p>


<details>
  <summary>Contents</summary>

- [About](#about)
- [Usage](#usage)
   * [Embedding](#embedding)
   * [Base Domain](#base-domain)
   * [Embed Contributors](#embed-contributors)
   * [Embed Sponsors](#embed-sponsors)
   * [Embed Stargazers](#embed-stargazers)
   * [Embed Forkers](#embed-forkers)
   * [Embed Watchers](#embed-watchers)
   * [Embed Followers](#embed-followers)
   * [Image Options](#image-options)
- [Deploying your Own](#deploying-your-own)
- [Developing](#developing)
- [Examples](#examples)
- [Web Interface](#web-interface)
- [Attributions](#attributions)
   * [Contributors](#contributors)
   * [Sponsors](#sponsors)
- [License](#license)

</details>

---

## About

It's nice to give credit to contributors and supporters who've helped your project 💞

This project gives you an easy way for you to embed your projects contributors, sponsors, stargazers, watchers, forkers, followers, etc, and to let you configure the look and feel. [↳ See Examples](#examples)

I use this in all my projects, because using GitHub Actions to generate these causes your commit history to become unnecessarily cluttered. And existing services to embed contributor widgets aren't very customizable and don't support sponsors, stargazers etc.

This app is also very easily self-hostable for free, either with 1-click deploy to Vercel or via Docker on any platform.

---

## Usage

### Embedding
To embed the image in your markdown, simply use the endpoint as the image URL.<br />
For example:

```
![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93)
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
/forkers/[user]/[repo]
```


### Embed Watchers

```
/watchers/[user]/[repo]
```


### Embed Followers

```
/followers/[user]
```

### Image Options

You can customize the outputed image, it's appearence and functionality with the following options. <br />
Specify these as query string parameters, appended to the end of your GET request. All values are optional.

| Parameter          | Description                                      | Type    | Default Value                       |
|--------------------|--------------------------------------------------|---------|-------------------------------------|
| `title`            | The title to be displayed above the widget       | String  | `''` (Empty string = no title)      |
| `avatarSize`       | Minimum size of avatars                          | Integer | `50`                                |
| `perRow`           | Maximum number of avatars per row                | Integer | `8`                                 |
| `shape`            | Shape of the avatar images (square, circle, squircle) | Enum    | `square`                       |
| `hideLabel`        | If set to true, name labels will not be displayed | Boolean | `false`                            |
| `fontSize`         | Font size for label text                         | Integer | `12`                                |
| `fontFamily`       | Font family for the text                         | String  | `'Mona Sans', Verdana, sans-serif`  |
| `textColor`        | Color of the text (as hex code excluding # or color name)  | String  | `333333` (exclude the `#`) |
| `backgroundColor`  | Background color of the widget                   | String  | `transparent`                       |
| `limit`            | Maximum number of items to display               | Integer | `100`                               |
| `outerBorderWidth` | Width of the outer border                        | Integer | `0`                                 |
| `outerBorderColor` | Color of the outer border                        | String  | `''` (Empty string = no border)     |
| `outerBorderRadius`| Radius of the outer border corners               | Integer | `0`                                 |
| `margin`           | Margin around each avatar                        | Integer | `20`                                |
| `textOffset`       | Offset for text alignment below avatars          | Integer | `20`                                |
| `svgWidth`         | Width of the entire SVG widget                   | Integer | `500`                               |
| `svgHeight`        | Height of the entire SVG widget                  | Integer | `500`                               |
| `dynamic`          | If true, won't base64 encode images, faster (iframe usage only) | Boolean | `false`              |
| `isResponsive`     | If true, makes the widget responsive             | Boolean | `false`                             |

View the [Swagger Docs](https://readme-contribs.as93.net/api-docs) for more details.

---

## Deploying your Own

If you plan to use this at any kind of scale, it is highly reccomended to deploy your own instance.

Don't worry, it's super quick, easy and free!

1. Fork this repository (by clicking [here](https://github.com/Lissy93/readme-contribs/fork))
2. Login / Sign up to [Vercel](https://vercel.com/login)
3. Create a new app, and select your newly forked repo
4. Create a GitHub API token [here](https://github.com/settings/tokens?type=beta)
5. Add the `GITHUB_TOKEN` environmental variable into Vercel
6. Hit deploy!

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLissy93%2Freadme-contribs&project-name=readme-contribs&repository-name=readme-contribs&env=GITHUB_TOKEN&demo-title=Readme%20Contribs&demo-description=Simple%20embeddable%20contributor%20and%20sponsor%20widgets%20for%20your%20GitHub%20README&demo-url=https%3A%2F%2Freadme-contribs.as93.net&demo-image=https%3A%2F%2Fgithub.com%2FLissy93%2Freadme-contribs%2Fblob%2Fmain%2Fpublic%2Ffavicon.png%3Fraw%3Dtrue)

### Deploy with Docker

```bash
docker run -p 8080:8080 -e GITHUB_TOKEN=your_token ghcr.io/lissy93/readme-contribs:latest
```

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

## Examples

<details><summary>Example 1</summary>

![Rust Lang Contributors](https://readme-contribs.as93.net/contributors/rust-lang/rust?hideLabel=true&margin=2&textOffset=0&perRow=10&title=Rust%20Lang%20Top%20Contributors&footerText=none)
</details>

<details><summary>Example 2</summary>

![Dashy Contributors](https://readme-contribs.as93.net/contributors/lissy93/dashy?shape=squircle&perRow=10&title=Lissy93%2FDashy%27s%20Top%20Contributors&textColor=black&backgroundColor=00d1b2&margin=6&hideLabel=true&textOffset=2&footerText=none)
</details>

<details><summary>Example 3</summary>

![AdGuardian Forkers](http://readme-contribs.as93.net/forkers/Lissy93/AdGuardian-Term?title=AdGuardian%20Forkers&textColor=bfbfbf&outerBorderWidth=2&outerBorderRadius=5&footerText=none)
</details>

<details><summary>Example 4</summary>

![Lissy93 Sponsors](https://readme-contribs.as93.net/sponsors/lissy93?shape=squircle&margin=16&textOffset=8&perRow=6&title=@Lissy93%27s%20Sponsors&textColor=white&&backgroundColor=black&fontFamily=Courier%20New&fontSize=8&footerText=none)
</details>

<details><summary>Example 5</summary>

![Web Check Stargazers](https://readme-contribs.as93.net/stargazers/lissy93/web-check?shape=square&margin=16&perRow=15&title=Web-Checks%20Stargazers&textColor=9fef00&backgroundColor=101215&fontFamily=cursive&fontSize=14&limit=90&footerText=none)
</details>

<details><summary>Example 6</summary>

![Hot Dog Stand lolz](https://readme-contribs.as93.net/stargazers/steverichey/hot-dog-stand?backgroundColor=red&textColor=yellow&outerBorderWidth=5&outerBorderRadius=8fontFamily=Comic%20Sans&fontSize=12&avatarSize=64&perRow=4&title=SteveRichey/Hot-Dog-Stand&footerText=none&shape=circle)
</details>

---

## Web Interface
If you're finding constructing the URL, and previewing the different options tricky, you can use our web interface to build your embedable card.

Visit [readme-contribs.as93.net](https://readme-contribs.as93.net/) to get started.

<p align="center"><a href="https://readme-contribs.as93.net"><img width="800" src="https://github.com/Lissy93/readme-contribs/assets/1862727/01dc1664-e78e-449b-bb9d-76a92c4487b6" /></a></p>

---

## Attributions

### Contributors

![Contributors](https://readme-contribs.as93.net/contributors/lissy93/readme-contribs)

### Sponsors

![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93)

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

