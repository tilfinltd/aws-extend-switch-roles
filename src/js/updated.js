import {SyncStorageRepository} from "./lib/storage_repository.js";

const updateData = {
    featuredUpdates: {
        title: "Recent main updates",
        sections: [
            {
                title: "Multi-Session Support",
                content: `Support for the new AWS Management Console "Multi-Session" feature, enabling simultaneous sign-in to multiple AWS accounts in different browser tabs.<br>
          <a href="https://aws.amazon.com/about-aws/whats-new/2025/01/aws-management-console-simultaneous-sign-in-multiple-accounts/" target="_blank">The AWS Management Console now supports simultaneous sign-in for multiple AWS accounts - AWS</a>`,
                features: [
                    "Maintain up to 5 different AWS account sessions in separate browser tabs",
                    "Each tab's session is managed independently, allowing for more flexible operations",
                    "Role chaining capability is now available. However, switch role targets are limited to the user context of the currently active browser tab.",
                    "Keep your organization's main account tab open, and switch to the target roles to work from it as needed."
                ]
            },
            {
                title: "'Automatic tab grouping for multi-session' setting (Experimental, Supporters only)",
                content: "This feature automatically organizes tabs from the same AWS Management Console multi-session into tab groups. When a tab group is removed, the corresponding session will be automatically signed out.",
                features: [
                    "Improves visibility by grouping tabs by profile name",
                    "Tab group color is automatically selected from 9 fixed colors closest to the profile-defined color",
                    "Supported only in Chrome and Edge versions that support tab groups",
                    "We recommend using <b>Delete group</b> instead of <b>Close Group</b> as both actions will trigger session sign-out."
                ],
                image: "data:image/png;base64,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",
                additionalInfo: {
                    title: "To open a new tab in the same group:",
                    items: [
                        "<b>Windows</b>: Hold down the <b>Control key</b> while clicking a link",
                        "<b>macOS</b>: Hold down the <b>Command key</b> while clicking a link"
                    ]
                }
            }
        ]
    },
    versions: [
        {
            version: "6.0.4",
            isNew: true,
            changes: [
                "Update <b>Design</b> to a Modern Look",
            ]
        },
        {
            version: "6.0.3",
            changes: [
                "Fix an issue where role switching failed in AWS GovCloud and China region",
                "Fix a potential internal storage corruption when configuration validation fails"
            ]
        },
        {
            version: "6.0.2",
            changes: [
                "Fix incorrect processing applied to iframes"
            ]
        },
        {
          version: "6.0.1",
            changes: [
                "Resolve an issue where users could not switch in the updated AWS Management Console"
            ]
        },
        {
            version: "6.0.0",
            changes: [
                "Add support for <b>multi-session</b> on the AWS Management Console",
                "Add support for <b>multi-level source profile references</b> to enable role chaining",
                "Add experimental feature: <b>Automatic tab grouping for multi-session</b> for supporters"
            ]
        },
        {
            version: "5.0.2",
            changes: [
                "Fix to highlight the relevant part when validation fails in the configuration textarea",
                "Fix <b>Show only matching roles</b> when target role ARN has a path"
            ]
        },
        {
            version: "5.0.1",
            changes: [
                'Add support for remote retrieval of user configurations through <a href="https://aesr.dev/" target="_blank"><b>AESR Config Hub</b></a>, facilitating dynamic configuration management.'
            ]
        },
        {
            version: "4.0.3",
            changes: [
                "Implement fallback for displaying the role list in Firefox private browsing mode"
            ]
        },
        {
            version: "4.0.2",
            changes: [
                "Fix parsing of 'role_arn' when the role name contains slashes"
            ]
        },
        {
            version: "4.0.1",
            changes: [
                "Fix the switch targets to list in the order of Simple profiles, followed by Complex target profiles",
                "Shorten the process of fetching user info during the loading of the AWS Management Console page"
            ]
        },
        {
            version: "4.0.0",
            changes: [
                "Change the storage location of profile data to <b>IndexedDB</b>, removing the registration number limit",
                "Update the host specification for the AWS Management Console"
            ]
        }
    ],
    customization: {
        title: "Recommended customization (only Chrome)",
        description: "If you don't need <b>AWS GovCloud</b> partition or <b>AWS China</b> partition, you can restrict access to your site from managing extensions.",
        steps: [
            "Open <b>Extensions</b> page.",
            "Click <b>Details</b> button of this extension.",
            "See <b>Site access</b>.",
            "Set <b>Automatically allow access on the following sites</b> off.",
            "Set <b>https://*.console.aws.amazon.com/*</b>, <b>https://health.aws.amazon.com/*</b> and <b>https://phd.aws.amazon.com/*</b> on."
        ]
    }
};



function renderContent() {
    const content = document.getElementById('content');
    let html = '';

    if (updateData.featuredUpdates) {
        html += '<section class="featured-section">';
        html += `<h2>${updateData.featuredUpdates.title}</h2>`;

        updateData.featuredUpdates.sections.forEach(section => {
            html += `<h3>${section.title}</h3>`;
            html += `<p>${section.content}</p>`;

            if (section.features && section.features.length > 0) {
                html += '<ul>';
                section.features.forEach(feature => {
                    html += `<li>${feature}</li>`;
                });
                html += '</ul>';
            }

            if (section.image) {
                html += '<figure>';
                html += `<img src="${section.image}" alt="${section.title}">`;
                html += '</figure>';
            }

            if (section.additionalInfo) {
                html += `<p>${section.additionalInfo.title}</p>`;
                html += '<ul>';
                section.additionalInfo.items.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += '</ul>';
            }
        });

        html += '</section>';
        html += '<hr>';
    }

    updateData.versions.forEach(version => {
        const cardClass = version.isNew ? 'version-card new' : 'version-card';
        html += `<div class="${cardClass}">`;
        html += '<div class="version-header">';
        html += `<span class="version-number">${version.version}</span>`;
        if (version.isNew) {
            html += '<span class="badge">NEW VERSION!</span>';
        }
        html += '</div>';
        html += '<ul>';
        version.changes.forEach(change => {
            html += `<li>${change}</li>`;
        });
        html += '</ul>';
        html += '</div>';
    });

    if (updateData.customization) {
        html += '<section class="info-box">';
        html += `<h2>${updateData.customization.title}</h2>`;
        html += `<p>${updateData.customization.description}</p>`;
        html += '<ol>';
        updateData.customization.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ol>';
        html += '</section>';
    }

    content.innerHTML = html;
}

const syncStorageRepo = new SyncStorageRepository(chrome || browser)
syncStorageRepo.get(['visualMode', 'autoTabGrouping']).then(({ visualMode }) => {
    const mode = visualMode || 'default';
    if (mode === 'dark' || (mode === 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('darkMode');
    }
});

document.addEventListener('DOMContentLoaded', renderContent);