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

This project gives you an easy way for you to embed your projects contributors, sponsors, stargazers, watchers, forkers, followers, etc, into your readme or website. And it's highly configurable, so you can customize the look and feel. [↳ See Examples](#examples)

It can be used for free at [here](https://readme-contribs.as93.net). But is also very quick, easy and free to deploy your own instance (either with 1-click deploy to Vercel or self-host anywhere with Docker).

I use this in all my projects, because:
- Using GitHub Actions to generate this info clutters up the commit log
- Existing services don't let you configure the look and feel
- I couldn't find anywhere else which also supported sponsors, stargazers etc.

---

## Usage

### Embedding
To embed the image in your markdown, simply use the endpoint as the image URL.<br />
For example:

```md
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
| `fontFamily`       | Font family for the text                         | String  | `'Mona Sans', 'Open Sans', Verdana, Arial, sans-serif` |
| `textColor`        | Color of the text (as hex code excluding # or color name)  | String  | `808080` (exclude the `#`) |
| `backgroundColor`  | Background color of the widget                   | String  | `transparent`                       |
| `limit`            | Maximum number of items to display               | Integer | `96`                                |
| `outerBorderWidth` | Width of the outer border                        | Integer | `0`                                 |
| `outerBorderColor` | Color of the outer border                        | String  | `''` (Empty string = no border)     |
| `outerBorderRadius`| Radius of the outer border corners               | Integer | `0`                                 |
| `margin`           | Margin around each avatar                        | Integer | `20`                                |
| `textOffset`       | Offset for text alignment below avatars          | Integer | `20`                                |
| `svgWidth`         | Width of the entire SVG widget (0 = auto)        | Integer | `0`                                 |
| `svgHeight`        | Height of the entire SVG widget (0 = auto)       | Integer | `0`                                 |
| `dynamic`          | If true, won't base64 encode images, faster (iframe usage only) | Boolean | `false`              |
| `isResponsive`     | If true, makes the widget responsive             | Boolean | `false`                             |

View the [Swagger Docs](https://readme-contribs.as93.net/api-docs) for more details.

---

## Deploying your Own

If you plan to use this at any kind of scale, it is highly reccomended to deploy your own instance.

Don't worry, it's super quick, easy and free!

Just [fork the repo](https://github.com/Lissy93/readme-contribs/fork), then [login](https://vercel.com/login) to Vercel and import your fork. Don't forget to [create a github token](https://github.com/settings/tokens) and set it to `GITHUB_TOKEN`. Then hit deploy!

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLissy93%2Freadme-contribs&project-name=readme-contribs&repository-name=readme-contribs&env=GITHUB_TOKEN&demo-title=Readme%20Contribs&demo-description=Simple%20embeddable%20contributor%20and%20sponsor%20widgets%20for%20your%20GitHub%20README&demo-url=https%3A%2F%2Freadme-contribs.as93.net&demo-image=https%3A%2F%2Fgithub.com%2FLissy93%2Freadme-contribs%2Fblob%2Fmain%2Fpublic%2Ffavicon.png%3Fraw%3Dtrue)

### Deploy with Docker

```bash
docker run -p 8080:8080 -e GITHUB_TOKEN=your_token ghcr.io/lissy93/readme-contribs:latest
```

---

## Developing

The app is built with with Hono with Zod. The frontend client is a simple Alpine app. It's designed to run either on serverless environments, or via Bun.
Running locally is easy, and all fairly standard. Just ensure you've got Node 24+, Bun and Git installed.

```bash
git clone git@github.com:Lissy93/readme-contribs.git    # Get the code
cd readme-contribs                                      # Navigate into directory
yarn                                                    # Install dependencies
yarn start                                              # Start the Bun server
open http://localhost:8080                              # Visit the running server
```

> [!IMPORTANT]
> Don't forget to add your token in the `GITHUB_TOKEN` environmental variable (or put it in `.env`)

---

## Contributing

To contribute, fork the repo, make your changes, and then open a pull request.
In the PR body, please briefly explain your changes and reasoning.

Before committing, run the following commands to ensure that all checks pass:

- `yarn test` - Verify all checks pass
- `yarn lint` - Ensure no lint errors or warnings
- `yarn format` - Check code is consistantly formatted
- `yarn type-check` - Validate all TS types and interfaces

> [!TIP]
> Run `yarn fix` to auto-fix all auto-fixable issues.<br>
> The [CI](https://github.com/Lissy93/readme-contribs/actions/workflows/ci.yml) workflow will also flag any failures and explain how to fix.

---

## Examples

<details><summary>Example 1</summary>

![Rust Lang Contributors](https://readme-contribs.as93.net/contributors/rust-lang/rust?hideLabel=true&margin=2&textOffset=0&perRow=10&title=Rust%20Lang%20Top%20Contributors&footerText=none)
</details>

<details><summary>Example 2</summary>

![Dashy Contributors](https://readme-contribs.as93.net/contributors/lissy93/dashy?shape=squircle&perRow=10&title=Lissy93%2FDashy%27s%20Top%20Contributors&textColor=black&backgroundColor=00d1b2&margin=6&hideLabel=true&textOffset=2&footerText=none)
</details>

<details><summary>Example 3</summary>

![AdGuardian Forkers](https://readme-contribs.as93.net/forkers/Lissy93/AdGuardian-Term?title=AdGuardian%20Forkers&textColor=bfbfbf&outerBorderWidth=2&outerBorderRadius=5&footerText=none)
</details>

<details><summary>Example 4</summary>

![Lissy93 Sponsors](https://readme-contribs.as93.net/sponsors/lissy93?shape=squircle&margin=16&textOffset=8&perRow=6&title=@Lissy93%27s%20Sponsors&textColor=white&&backgroundColor=black&fontFamily=Courier%20New&fontSize=8&footerText=none)
</details>

<details><summary>Example 5</summary>

![Web Check Stargazers](https://readme-contribs.as93.net/stargazers/lissy93/web-check?shape=square&margin=16&perRow=15&title=Web-Checks%20Stargazers&textColor=9fef00&backgroundColor=101215&fontFamily=cursive&fontSize=14&limit=90&footerText=none)
</details>

<details><summary>Example 6</summary>

![Hot Dog Stand lolz](https://readme-contribs.as93.net/stargazers/steverichey/hot-dog-stand?backgroundColor=red&textColor=yellow&outerBorderWidth=5&outerBorderRadius=8&fontFamily=Comic%20Sans&fontSize=12&avatarSize=64&perRow=4&title=SteveRichey/Hot-Dog-Stand&footerText=none&shape=circle)
</details>

---

## Web Interface
If you're finding constructing the URL, and previewing the different options tricky, you can use our web interface to build your embedable card.

Visit [readme-contribs.as93.net](https://readme-contribs.as93.net/) to get started.

<p align="center"><a href="https://readme-contribs.as93.net"><img width="800" src="https://github.com/Lissy93/readme-contribs/assets/1862727/01dc1664-e78e-449b-bb9d-76a92c4487b6" /></a></p>

---

## Attributions

### Contributors

![Contributors](https://readme-contribs.as93.net/contributors/lissy93/readme-contribs?perRow=12&shape=squircle)

### Sponsors

![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93?perRow=12&shape=squircle)

### Stargazers

![Stargazers](https://readme-contribs.as93.net/stargazers/lissy93/readme-contribs?perRow=12&shape=squircle)

---

## License

> _**[Lissy93/README-Contribs](https://github.com/Lissy93/readme-contribs)** is licensed under [MIT](https://github.com/Lissy93/readme-contribs/blob/HEAD/LICENSE) © [Alicia Sykes](https://aliciasykes.com) 2026._<br>
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

The above copyright notice and this permission notice shall be included in all
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
  <i>© <a href="https://aliciasykes.com">Alicia Sykes</a> 2026</i><br>
  <i>Licensed under <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17">MIT</a></i><br>
  <a href="https://github.com/lissy93"><img src="https://pixelflare.cc/alicia/images/octoface.png?w=56" /></a><br>
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

