const languages = [
  "javascript",
  "go",
  "php",
  "java",
  "ruby",
  "python",
  "csharp",
];

document.addEventListener("DOMContentLoaded", async () => {
  // Add loading animation
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <h2 class="loading-text">Loading Documentation</h2>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  // Add styles for the loading animation
  const styleLoading = document.createElement("style");
  styleLoading.textContent = `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.5s ease-out;
    }
    .loading-content {
      text-align: center;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid #3498db;
      border-top: 3px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    .loading-text {
      font-size: 24px;
      color: #3498db;
      font-weight: bold;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(styleLoading);

  // Add Roboto font for code blocks
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);

  // Fetch Swagger data and menu
  const [swaggerResponse, menuResponse] = await Promise.all([
    fetch("/assets/swagger.json"),
    fetch("/assets/menu.json"),
  ]);
  const swaggerData = await swaggerResponse.json();
  const Menu = await menuResponse.json();

  // Set the title dynamically
  document.title = Menu.title;
  document.querySelector("h1").textContent = Menu.title;

  document.documentElement.style.scrollBehavior = "smooth";

  const sidebarNav = document.getElementById("sidebar-nav");
  const content = document.getElementById("content");

  // Populate sidebar
  const ul = document.createElement("ul");
  ul.className = "space-y-4";

  swaggerData.tags.forEach((tag) => {
    const li = document.createElement("li");
    const tagTitle = document.createElement("h3");
    tagTitle.textContent = tag.name;
    tagTitle.className =
      "text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer";
    li.appendChild(tagTitle);

    const subMenu = document.createElement("ul");
    subMenu.className = "mt-2 linker space-y-1 hidden";

    // Filter paths for the current tag
    const tagPaths = Object.entries(swaggerData.paths).filter(([_, methods]) =>
      Object.values(methods).some((method) => method.tags.includes(tag.name))
    );

    tagPaths.forEach(([path, methods]) => {
      const subLi = document.createElement("li");
      const a = document.createElement("a");
      // Create a sanitized ID from the path
      const sectionId = path
        .replace(/\//g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      a.href = `#${sectionId}`;
      // Find the corresponding menu item
      const menuItem = Menu[tag.name].find((item) => item.path === path);
      a.textContent = menuItem ? menuItem.name : path; // Use menu name if available, otherwise use path

      a.className =
        "block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-150 ease-in-out rounded";
      subLi.appendChild(a);
      subMenu.appendChild(subLi);
    });

    // Toggle submenu visibility on click
    tagTitle.onclick = () => {
      subMenu.classList.toggle("hidden");
      subMenu.classList.toggle("fade-in"); // Add fade-in class for animation
    };

    li.appendChild(subMenu);
    ul.appendChild(li);
  });

  // Append the sidebar navigation to the DOM
  sidebarNav.appendChild(ul);

  // Add event listeners to the menu items AFTER they are appended to the DOM
  document.querySelectorAll("#sidebar-nav a").forEach((a) => {
    a.addEventListener("click", handleLinkClick);
  });

  // Add CSS for sidebar padding and fade-in animation
  const style = document.createElement("style");
  style.textContent = `
    #sidebar-nav {
      padding: 16px; /* Add padding to the sidebar */
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  // Populate content
  // Add summary section if it exists
  if (Menu.Summary && Menu.Summary.length > 0) {
    const summarySection = document.createElement("section");
    summarySection.className =
      "mb-12 bg-white rounded-lg shadow-lg overflow-hidden";
    summarySection.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
        <h2 class="text-3xl font-bold text-white">API Summary</h2>
      </div>
      <div class="p-8 space-y-8">
        ${Menu.Summary.map(
          (item) => `
          <div class="summary-item">
            <h3 class="text-2xl font-semibold mb-3 text-gray-800">${item.name}</h3>
            <div class="bg-gray-100 rounded-lg p-6">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${item.content}</p>
            </div>
          </div>
        `
        ).join("")}
      </div>
    `;
    content.appendChild(summarySection);

    // Add custom styles for the summary section
    const style = document.createElement("style");
    style.textContent = `
      .summary-item h3 {
        position: relative;
        padding-left: 20px;
      }
      .summary-item h3::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background-color: #3B82F6;
        border-radius: 50%;
      }
      .summary-item .bg-gray-100 {
        border-left: 4px solid #3B82F6;
      }
    `;
    document.head.appendChild(style);
  }

  for (const [path, methods] of Object.entries(swaggerData.paths)) {
    const section = document.createElement("section");
    // Create a sanitized ID from the path
    const sectionId = path
      .replace(/\//g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    section.id = sectionId;
    section.className =
      "endpoint mb-12 bg-white rounded-lg shadow-md overflow-hidden opacity-0 transform translate-y-4 transition-all duration-500 ease-out";

    // Add main header
    const h2 = document.createElement("h2");
    h2.innerHTML = (() => {
      const AllMethods = Object.keys(methods);
      const Text = `<span class="path-text" data-path="${path}">Path: ${path}</span> <br> Method Allowed: ${AllMethods.join(
        ", "
      )}`;
      return Text;
    })();
    h2.className =
      "text-2xl font-bold mb-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-gray-800";
    section.appendChild(h2);

    const contentDiv = document.createElement("div");
    contentDiv.className = "p-6";
    console.log(methods);
    for (const [method, details] of Object.entries(methods)) {
      const methodDiv = document.createElement("div");
      methodDiv.className = "mb-6";

      const methodSpan = document.createElement("span");
      methodSpan.textContent = method.toUpperCase();
      methodSpan.className = `inline-block px-2 py-1 rounded-full text-xs font-semibold mr-2 ${getMethodColor(
        method
      )}`;
      methodDiv.appendChild(methodSpan);

      const summary = document.createElement("span");
      summary.textContent = details.summary || "";
      summary.className = "ml-2 text-sm text-gray-600";
      methodDiv.appendChild(summary);
      // add horizontal line and break
      const breakLine = document.createElement("br");
      methodDiv.appendChild(breakLine);
      const horizontalLine = document.createElement("hr");
      horizontalLine.className = "my-4";
      methodDiv.appendChild(horizontalLine);
      const menuDescription = document.createElement("span");
      menuDescription.textContent = Menu[details.tags[0]].find(
        (item) => item.path === path
      ).description;
      menuDescription.className = "ml-2 text-sm text-gray-600";
      methodDiv.appendChild(menuDescription);

      const codeSamples = createCodeSamples(path, method, details, swaggerData);
      methodDiv.appendChild(codeSamples);

      contentDiv.appendChild(methodDiv);
    }

    section.appendChild(contentDiv);
    content.appendChild(section);

    // Animate section entrance
    setTimeout(() => {
      section.classList.remove("opacity-0", "translate-y-4");
    }, 100 * Array.from(content.children).indexOf(section));
  }

  // Initialize highlight.js
  hljs.highlightAll();

  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    sidebar.classList.toggle("sidebar-open");
    overlay.classList.toggle("active");
    document.body.classList.toggle("overflow-hidden");
  }

  function handleMobileView() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Adjust font sizes for mobile
      document.querySelectorAll(".endpoint h2").forEach((h2) => {
        h2.classList.remove("text-2xl");
        h2.classList.add("text-xl");
      });

      document.querySelectorAll(".endpoint .text-sm").forEach((el) => {
        el.classList.remove("text-sm");
        el.classList.add("text-xs");
      });
    } else {
      // Reset font sizes for desktop
      document.querySelectorAll(".endpoint h2").forEach((h2) => {
        h2.classList.remove("text-xl");
        h2.classList.add("text-2xl");
      });

      document.querySelectorAll(".endpoint .text-xs").forEach((el) => {
        el.classList.remove("text-xs");
        el.classList.add("text-sm");
      });
    }
  }

  function closeSidebarAndScroll(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute("href").slice(1);
    toggleSidebar(); // Close the sidebar
    setTimeout(() => {
      scrollToSection(targetId);
    }, 300); // Wait for sidebar animation to complete
  }

  function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    const mainContent = document.getElementById("main-content");
    console.log(targetElement);
    if (targetElement) {
      const isMobile = window.innerWidth <= 768;
      const offset = isMobile ? 80 : 100; // Adjusted offset for mobile
      // get target element inside maincontent and scroll there
      // const targetPosition =
      //   targetElement.getBoundingClientRect().top +
      //   mainContent.getBoundingClientRect().top -
      //   offset;
      // window.scrollTo({
      //   top: targetPosition,
      //   behavior: "smooth",
      // });
      targetElement.scrollIntoView({ behavior: "smooth" });
      // Hig  hlight the target section
      targetElement.classList.add("highlight-section");
      setTimeout(() => {
        targetElement.classList.remove("highlight-section");
      }, 2000);
    } else {
      console.error(`Element with id "${targetId}" not found`);
    }
  }

  function handleLinkClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute("href").slice(1);
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      toggleSidebar(); // Close the sidebar
      setTimeout(() => {
        scrollToSection(targetId);
      }, 300); // Wait for sidebar animation to complete
    } else {
      scrollToSection(targetId);
    }
  }

  // Call handleMobileView on initial load and window resize
  handleMobileView();
  window.addEventListener("resize", handleMobileView);

  // Add event listener for sidebar toggle button
  const sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Add event listener for overlay to close sidebar
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.addEventListener("click", toggleSidebar);
  }

  // Add scroll-based animations for sections
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll(".endpoint");
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (sectionTop < windowHeight * 0.75) {
        section.classList.remove("opacity-0", "translate-y-4");
      }
    });
  });

  function getMethodColor(method) {
    switch (method.toLowerCase()) {
      case "get":
        return "bg-blue-100 text-blue-800";
      case "post":
        return "bg-green-100 text-green-800";
      case "put":
        return "bg-yellow-100 text-yellow-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function createCodeSamples(path, method, details, swaggerData) {
    // Remove 'languages' array from here since it's now global
    const wrapper = document.createElement("div");
    wrapper.className = "code-sample mt-4";

    const tabs = document.createElement("div");
    tabs.className =
      "language-tabs flex space-x-1 bg-gray-100 p-1 rounded-t-lg overflow-x-auto";

    const samples = document.createElement("div");
    samples.className = "bg-gray-900 rounded-b-lg";

    languages.forEach((lang, index) => {
      const tab = document.createElement("button");
      tab.textContent = lang;
      tab.className = `language-tab px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ease-in-out ${
        index === 0
          ? "bg-gray-800 text-white"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
      }`;
      tab.onclick = () => switchTab(lang, tabs, samples);
      tabs.appendChild(tab);

      const sampleWrapper = document.createElement("div");
      sampleWrapper.className = `relative ${index === 0 ? "" : "hidden"}`;

      const sample = document.createElement("pre");
      sample.className = `language-${lang} m-0 p-4`;
      const code = document.createElement("code");
      code.className = `language-${lang}`;
      code.textContent = generateCodeSample(
        lang,
        path,
        method,
        details,
        swaggerData
      );
      sample.appendChild(code);

      const copyButton = document.createElement("button");
      copyButton.textContent = "Copy";
      copyButton.className =
        "absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75";
      copyButton.onclick = () => copyCode(code.textContent);

      sampleWrapper.appendChild(sample);
      sampleWrapper.appendChild(copyButton);
      samples.appendChild(sampleWrapper);
    });

    wrapper.appendChild(tabs);
    wrapper.appendChild(samples);
    return wrapper;
  }

  function copyCode(text) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Could not copy text: ", err);
    });
  }

  function switchTab(lang, tabs, samples) {
    // Remove 'languages' from parameters since it's global
    tabs.querySelectorAll(".language-tab").forEach((tab) => {
      tab.classList.remove("bg-gray-800", "text-white");
      tab.classList.add(
        "text-gray-500",
        "hover:text-gray-900",
        "hover:bg-gray-200"
      );
    });
    // Find the active tab and sample based on the language
    const activeTabIndex = languages.indexOf(lang);
    tabs
      .querySelector(`.language-tab:nth-child(${activeTabIndex + 1})`)
      .classList.add("bg-gray-800", "text-white");

    samples
      .querySelectorAll("div")
      .forEach((sample) => sample.classList.add("hidden"));
    samples
      .querySelector(`div:nth-child(${activeTabIndex + 1})`)
      .classList.remove("hidden");
  }

  function generateCodeSample(language, path, method, details, swaggerData) {
    let requestBody = "";
    let responseBody = "";
    let needsAuth =
      details.security && details.security.some((sec) => sec.bearerAuth);

    // Extract request body if it exists
    if (details.requestBody && details.requestBody.content) {
      const contentType = Object.keys(details.requestBody.content)[0];
      const schema = details.requestBody.content[contentType].schema;
      requestBody = JSON.stringify(
        generateSampleFromSchema(schema, swaggerData),
        null,
        2
      );
    }

    // Extract response body
    const successResponse = Object.values(details.responses).find(
      (response) => response.content
    );
    if (successResponse && successResponse.content) {
      const contentType = Object.keys(successResponse.content)[0];
      const schema = successResponse.content[contentType].schema;
      responseBody = JSON.stringify(
        generateSampleFromSchema(schema, swaggerData),
        null,
        2
      );
    }

    switch (language) {
      case "javascript":
        return `
${needsAuth ? "const token = 'YOUR_AUTH_TOKEN';\n" : ""}${
          requestBody ? `const requestBody = ${requestBody};\n` : ""
        }
fetch('${path}', {
  method: '${method.toUpperCase()}',${
          requestBody ? "\n  body: JSON.stringify(requestBody)," : ""
        }
  headers: {${needsAuth ? "\n    'Authorization': `Bearer ${token}`," : ""}${
          requestBody ? "\n    'Content-Type': 'application/json'" : ""
        }
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Response:', data);
    // Expected response:
    // ${responseBody.replace(/\n/g, "\n    // ")}
  })
  .catch(error => console.error('Error:', error));
`;

      case "go":
        return `
package main

import (
    "fmt"
    "net/http"${requestBody ? '\n    "bytes"' : ""}\n    "io/ioutil"${
          requestBody ? '\n    "encoding/json"' : ""
        }
)

func main() {${needsAuth ? '\n    token := "YOUR_AUTH_TOKEN"' : ""}${
          requestBody ? `\n    requestBody := []byte(\`${requestBody}\`)` : ""
        }
    req, _ := http.NewRequest("${method.toUpperCase()}", "${path}", ${
          requestBody ? "bytes.NewBuffer(requestBody)" : "nil"
        })
${needsAuth ? '    req.Header.Add("Authorization", "Bearer " + token)' : ""}${
          requestBody
            ? '\n    req.Header.Add("Content-Type", "application/json")'
            : ""
        }
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println("Response:", string(body))
    // Expected response:
    // ${responseBody.replace(/\n/g, "\n    // ")}
}
`;

      case "php":
        return `
<?php
${needsAuth ? '$token = "YOUR_AUTH_TOKEN";' : ""}
${requestBody ? `$requestBody = '${requestBody}';\n` : ""}
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${path}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "${method.toUpperCase()}",
  ${requestBody ? "CURLOPT_POSTFIELDS => $requestBody,\n" : ""}
  CURLOPT_HTTPHEADER => [
    ${needsAuth ? '"Authorization: Bearer " . $token,\n' : ""}
    ${requestBody ? '"Content-Type: application/json"' : ""}
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo "Response:\\n" . $response;
  // Expected response:
  // ${responseBody.replace(/\n/g, "\n  // ")}
}
`;

      case "java":
        return `
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
${requestBody ? "import java.net.http.HttpRequest.BodyPublishers;\n" : ""}

public class ApiRequest {
    public static void main(String[] args) throws Exception {
        ${needsAuth ? 'String token = "YOUR_AUTH_TOKEN";\n' : ""}
        ${
          requestBody
            ? `String requestBody = "${requestBody.replace(/"/g, '\\"')}";\n`
            : ""
        }
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${path}"))
            .method("${method.toUpperCase()}", ${
          requestBody
            ? "BodyPublishers.ofString(requestBody)"
            : "HttpRequest.BodyPublishers.noBody()"
        })
            ${needsAuth ? '.header("Authorization", "Bearer " + token)\n' : ""}
            ${
              requestBody ? '.header("Content-Type", "application/json")\n' : ""
            }
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Response: " + response.body());
        // Expected response:
        // ${responseBody.replace(/\n/g, "\n        // ")}
    }
}
`;

      case "ruby":
        return `
require 'uri'
require 'net/http'
require 'json'

${needsAuth ? 'token = "YOUR_AUTH_TOKEN"' : ""}
${requestBody ? `request_body = '${requestBody}'\n` : ""}

uri = URI('${path}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = (uri.scheme == 'https')

request = Net::HTTP::${
          method.charAt(0).toUpperCase() + method.slice(1)
        }.new(uri)
${needsAuth ? 'request["Authorization"] = "Bearer #{token}"\n' : ""}
${requestBody ? 'request["Content-Type"] = "application/json"\n' : ""}
${requestBody ? "request.body = request_body\n" : ""}

response = http.request(request)
puts "Response: #{response.body}"
# Expected response:
# ${responseBody.replace(/\n/g, "\n# ")}
`;

      case "python":
        return `
import requests
import json

${needsAuth ? 'token = "YOUR_AUTH_TOKEN"' : ""}
${requestBody ? `request_body = '${requestBody}'\n` : ""}

url = "${path}"
headers = {
    ${needsAuth ? '"Authorization": f"Bearer {token}",\n' : ""}
    ${requestBody ? '"Content-Type": "application/json"' : ""}
}

response = requests.${method.toLowerCase()}(url, ${
          requestBody ? "data=request_body, " : ""
        }headers=headers)

print("Response:", response.text)
# Expected response:
# ${responseBody.replace(/\n/g, "\n# ")}
`;

      case "csharp":
        return `
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

class Program
{
    static async Task Main(string[] args)
    {
        ${needsAuth ? 'string token = "YOUR_AUTH_TOKEN";\n' : ""}
        ${
          requestBody
            ? `string requestBody = @"${requestBody.replace(/"/g, '""')}";\n`
            : ""
        }
        using (var client = new HttpClient())
        {
            ${
              needsAuth
                ? 'client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");\n'
                : ""
            }
            ${
              requestBody
                ? 'client.DefaultRequestHeaders.Add("Content-Type", "application/json");\n'
                : ""
            }

            HttpResponseMessage response = await client.${
              method.charAt(0).toUpperCase() + method.slice(1)
            }Async(
                "${path}",
                ${
                  requestBody
                    ? 'new StringContent(requestBody, Encoding.UTF8, "application/json")'
                    : "null"
                }
            );

            string responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response: {responseBody}");
            // Expected response:
            // ${responseBody.replace(/\n/g, "\n            // ")}
        }
    }
}
`;
      // Add other languages as needed

      default:
        return "// Language not supported.";
    }
  }

  function generateSampleFromSchema(schema, swaggerData) {
    try {
      if (schema.$ref) {
        // Handle references to other schemas
        const refPath = schema.$ref.replace(/^#\//, "").split("/");
        let refSchema = swaggerData;
        for (const part of refPath) {
          if (refSchema[part]) {
            refSchema = refSchema[part];
          } else {
            console.warn(`Unable to resolve reference: ${schema.$ref}`);
            return null;
          }
        }
        return generateSampleFromSchema(refSchema, swaggerData);
      }

      switch (schema.type) {
        case "object":
          const obj = {};
          for (const [key, prop] of Object.entries(schema.properties || {})) {
            obj[key] = generateSampleFromSchema(prop, swaggerData);
          }
          return obj;
        case "array":
          return [generateSampleFromSchema(schema.items, swaggerData)];
        case "string":
          return schema.example || "string";
        case "number":
        case "integer":
          return schema.example || 0;
        case "boolean":
          return schema.example || false;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error generating sample from schema:", error);
      return null;
    }
  }

  // Animate loading and initialize docs
  setTimeout(() => {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.remove();
    }, 500);
  }, 1500);
});
