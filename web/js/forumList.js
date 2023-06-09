// Set up markdown.
showdown.extension("targetlink", function() {
    return [{
      type: "html",
      regex: /(<a [^>]+?)(>.*<\/a>)/g,
      replace: "$1 target=\"_blank\"$2"
    }];
  });

let converter = new showdown.Converter({
    "tables": true,
    "extensions": ["targetlink"],
});

// Prepare storing the state.
let staticList = null;
let sortOptions = {
    "CREATE_TIME_DESCENDING": {
        "displayName": "Create Time (Newest First)",
        "sortFunction": function(a, b) {
            return new Date(a.createTime) > new Date(b.createTime) ? -1 : 1;
        },
    },
    "CREATE_TIME_ASCENDING": {
        "displayName": "Create Time (Oldest First)",
        "sortFunction": function(a, b) {
            return new Date(a.createTime) < new Date(b.createTime) ? -1 : 1;
        },
    },
};
let forumAttributeOptions = [
    {
        "attribute": "isLocked",
        "displayName": "🔒 Locked",
    },
    {
        "attribute": "isArchived",
        "displayName": "📦 Archived",
    },
];
let filterData = {
    "sortOption": "CREATE_TIME_DESCENDING",
    "attributes": {},
    "tags": {},
};



/*
 * Starts loading the thread messages.
 */
function startLoadingMessages() {
    let windowHeight = window.innerHeight;
    Array.from(document.getElementsByClassName("ForumThread")).forEach(forumThreadElement => {
        // Return if the message is not meant to be loaded.
        let forumThreadIndex = Number(forumThreadElement.getAttribute("forumListIndex"));
        let elementPositionY = forumThreadElement.getBoundingClientRect().top;
        if (elementPositionY > (2 * windowHeight)) return;

        // Return if the message is already loading or loaded.
        let forumThread = listResponse.threads[forumThreadIndex];
        if (forumThread.messageLoadState != null) return;

        // Start loading the message.
        forumThread.messageLoadState = "LOADING";
        fetch("/api/contents/" + forumThread.id + "?cacheClear=" + Math.random()).then(function(response) {
            if (!response.ok) {
                forumThread.messageLoadState = "ERROR";
                forumThread.forumThreadElement.refresh()
                throw new Error("Failed to thread message " + forumThread.id);
            }
            return response.json();
            }).then(function(data) {
                forumThread.messageLoadState = "LOADED";
                forumThread.message = data.message;
                forumThread.forumThreadElement.refresh()
            }).catch(function() {
                console.log("Failed to thread message " + forumThread.id + " " + forumThread.url);
                forumThread.messageLoadState = "ERROR";
                forumThread.forumThreadElement.refresh()
            });
    })
}

/*
 * Loads the filter data in the URL.
 */
function loadFilterData() {
    try {
        // Get the existing filter string.
        let urlQuery = new URLSearchParams(window.location.search);
        let existingFilter = urlQuery.get("filter");
        if (existingFilter == null) {
            existingFilter = "";
        }

        // Decode the data and set the filter data.
        let newFilterData = JSON.parse(atob(existingFilter));
        if (sortOptions[newFilterData.sortOption] == null) {
            newFilterData.sortOption = "CREATE_TIME_DESCENDING";
        }
        filterData = newFilterData;
    } catch (error) {
        filterData = {
            "sortOption": "CREATE_TIME_DESCENDING",
            "attributes": {},
            "tags": {},
        }
    }
    if (staticList != null) {
        staticList.refresh();
    }
}

/*
 * Saves the filter data in the URL.
 */
function saveFilterData() {
    // Get the existing filter string.
    let urlQuery = new URLSearchParams(window.location.search);
    let existingFilter = urlQuery.get("filter");
    if (existingFilter == null) {
        existingFilter = "";
    }
    
    // Build the new filter string.
    let newFilterData = btoa(JSON.stringify(filterData));
    if (filterData.sortOption == "CREATE_TIME_DESCENDING" && Object.entries(filterData.attributes).length == 0 && Object.entries(filterData.tags).length == 0) {
        newFilterData = "";
    }

    // Update the URL for the filter data.
    if (existingFilter == newFilterData) {
        return;
    }
    let path = document.location.pathname;
    if (newFilterData != "") {
        path += "?filter=" + newFilterData;
    }
    history.pushState(document.location.pathname, document.title, path);
}

/*
 * Sorts the threads.
 */
function sortThreads() {
    listResponse.threads = listResponse.threads.sort(sortOptions[filterData.sortOption].sortFunction);
    if (staticList != null) {
        staticList.refresh();
    }
}

/*
 * Returns if a a thread passes the filter.
 */
function threadPassesFilter(forumThread) {
    // Return false if the attributes don't match.
    var attributes = Object.entries(filterData.attributes);
    for (let i = 0; i < attributes.length; i++) {
        let attributeName = attributes[i][0];
        let attributeMatches = attributes[i][1];
        if (forumThread.accessState[attributeName] != attributeMatches) {
            return false;
        }
    }

    // Return false if the tags don't match.
    var tags = Object.entries(filterData.tags);
    for (let i = 0; i < tags.length; i++) {
        let tagId = tags[i][0];
        let tagMatch = tags[i][1];
        if (tagMatch == null) continue;
        if (forumThread.tags.includes(tagId) != filterData.tags[tagId]) {
            return false;
        }
    }

    // Return true (filter passes).
    return true;
}

/*
 * Toggles the requested filter for an attribute.
 */
function toggleAttributeFilter(attributeName) {
    if (filterData.attributes[attributeName] == true) {
        filterData.attributes[attributeName] = false;
    } else if (filterData.attributes[attributeName] == false) {
        delete filterData.attributes[attributeName];
    } else {
        filterData.attributes[attributeName] = true;
    }
    staticList.refresh();
}

/*
 * Toggles the requested filter for a tag.
 */
function toggleTagFilter(tagId) {
    if (filterData.tags[tagId] == true) {
        filterData.tags[tagId] = false;
    } else if (filterData.tags[tagId] == false) {
        delete filterData.tags[tagId];
    } else {
        filterData.tags[tagId] = true;
    }
    staticList.refresh();
}



class ForumListFilterBar extends React.Component {
    /*
     * Creates the forum list filter bar.
     */
    constructor(props) {
        super(props);
        this.state = {
            "sortViewOpen": false,
        };
        this.refresh = this.refresh.bind(this);
    }

    /*
     * Refreshes the filter view.
     */
    refresh() {
        this.setState(this.state);
    }

    /*
     * Returns the HTML structure of the element.
     */
    render() {
        // Build the attribute buttons.
        let attributeButtons = [];
        forumAttributeOptions.forEach(attribute => {
            let className = "FilterButton";
            if (filterData.attributes[attribute.attribute] == true) {
                className += " FilterButtonSelectedInclude"
            } else if (filterData.attributes[attribute.attribute] == false) {
                className += " FilterButtonSelectedExclude"
            }
            attributeButtons.push(<div class={className} onClick={function() { toggleAttributeFilter(attribute.attribute) }}>
                <span class="FilterButtonText">{attribute.displayName}</span>
            </div>);
        });

        // Build the tag buttons.
        let tagButtons = [];
        listResponse.tags.forEach(tag => {
            let tagText = tag.name;
            if (tag.emoji != null) {
                tagText = tag.emoji + " " + tag.name;
            }
            let className = "FilterButton";
            if (filterData.tags[tag.id] == true) {
                className += " FilterButtonSelectedInclude"
            } else if (filterData.tags[tag.id] == false) {
                className += " FilterButtonSelectedExclude"
            }
            tagButtons.push(<div class={className} onClick={function() { toggleTagFilter(tag.id) }}>
                <span class="FilterButtonText">{tagText}</span>
            </div>);
        });

        // Build the sort list.
        let sortDropDown = null;
        let sortOpenIconPath = "M16.59 8.59003L12 13.17L7.41 8.59003L6 10L12 16L18 10L16.59 8.59003Z";
        if (this.state.sortViewOpen == true) {
            let sortButtons = [];
            sortOpenIconPath = "M7.41 16.0001L12 11.4201L16.59 16.0001L18 14.5901L12 8.59006L6 14.5901L7.41 16.0001Z";
            Object.entries(sortOptions).forEach(sortMethodPair => {
                sortButtons.push(<div class={filterData.sortOption == sortMethodPair[0] ? "FilterDropDownButton Secondary Bold" : "FilterDropDownButton Secondary"} onClick={function() { filterData.sortOption = sortMethodPair[0]; sortThreads(); }}>{sortMethodPair[1].displayName}</div>)
            });
            sortDropDown = <div class="FilterDropDownBackground">{sortButtons}</div>;
        }

        // Return the bar.
        let filterBar = this;
        return <div class="ForumListFilterBar">
            <div class="FilterButton" onClick={function() {filterBar.state.sortViewOpen = !filterBar.state.sortViewOpen; filterBar.refresh();}}>
                <svg class="FilterButtonIcon Secondary" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M12.1803 4.66659L12.1803 14.6666H10.4701L10.4701 4.66659L8.53289 6.63325L7.33329 5.40825L11.3292 1.33325L15.3333 5.40825L14.1337 6.65825L12.1803 4.66659Z"></path><path fill="currentColor" d="M3.81962 11.3333L3.81962 1.33325L5.52983 1.33325L5.52985 11.3333L7.46703 9.36658L8.66663 10.5916L4.67068 14.6666L0.666626 10.5916L1.86622 9.34158L3.81962 11.3333Z"></path></svg>
                <span class="FilterButtonText Secondary">Sort</span>
                <svg class="FilterButtonToggleIcon Secondary" width="20" height="24" viewBox="0 0 24 24"><path fill="currentColor" d={sortOpenIconPath}></path></svg>
                {sortDropDown}
            </div>
            <div class="FilterSeparator"></div>
            {attributeButtons}
            <div class="FilterSeparator"></div>
            {tagButtons}
        </div>
    }
}

class ForumListThread extends React.Component {
    /*
     * Creates the forum list thread.
     */
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
    }

    /*
     * Refreshes the displayed message.
     */
    refresh() {
        this.setState({});
    }

    /*
     * Returns the HTML structure of the element.
     */
    render() {
        // Format the dates.
        let forumThread = listResponse.threads[this.props.listIndex];
        let postDate = new Date(forumThread.createTime)
        let dateInformation = "Posted " + postDate.toLocaleDateString("en-us", { year: "numeric", month: "long", day: "numeric"}) + " at " + postDate.toLocaleTimeString();
        if (forumThread.message != null && forumThread.message.editTime != null) {
            let editDate = new Date(forumThread.message.editTime);
            dateInformation += ", Edited " + editDate.toLocaleDateString("en-us", { year: "numeric", month: "long", day: "numeric"}) + " at " + editDate.toLocaleTimeString();
        }

        // Build the tags.
        let tags = [];
        listResponse.tags.forEach(tag => {
            if (!forumThread.tags.includes(tag.id)) return;
            let tagText = tag.name;
            if (tag.emoji != null) {
                tagText = tag.emoji + " " + tag.name;
            }
            tags.push(<span class="ForumThreadTag">{tagText}</span>)
        });

        // Build the additional attributes.
        let attributes = [];
        forumAttributeOptions.forEach(attribute => {
            if (forumThread.accessState[attribute.attribute]) {
                attributes.push(<span class="ForumThreadTag">{attribute.displayName}</span>)
            }
        });

        // Build the message.
        let messageContents = <div class="ForumTextContents Secondary">Loading...</div>;
        if (forumThread.message != null) {
            let message = forumThread.message.message;
            if (message == null || message == "") {
                messageContents = <div class="ForumTextContents Secondary"><i>No message.</i></div>;
            } else {
                messageContents = <div class="ForumTextContents" dangerouslySetInnerHTML={{__html: converter.makeHtml(message)}}></div>;
            }
    
        } else if (forumThread.messageLoadState == "LOADED") {
            messageContents = <div class="ForumTextContents Secondary"><i>Original message deleted.</i></div>;
        } else if (forumThread.messageLoadState == "ERROR") {
            messageContents = <div class="ForumTextContents Secondary"><i>Message failed to load.</i></div>;
        }

        // Build the reactions.
        let reactions = [];
        if (forumThread.message != null && forumThread.message.reactions) {
            forumThread.message.reactions.forEach(reaction => reactions.push(<span class="ForumThreadReaction">{reaction.reaction + " " + reaction.total}</span>));
        }

        // Build the attachments.
        // TODO: Find a better way of doing this.
        let mainContentsClass = "ForumThreadMainContents"
        let attachments = null;
        if (forumThread.message != null && forumThread.message.attachments.length > 0) {
            mainContentsClass += " ForumThreadMainContentsWithAttachments";
            if (forumThread.message.attachments.length == 1) {
                attachments = <div class="ForumThreadAttachments">
                    <img class="ForumThreadAttachment FullWidth FullHeight" src={forumThread.message.attachments[0].url}></img>
                </div>;
            } else if (forumThread.message.attachments.length == 2) {
                attachments = <div class="ForumThreadAttachments">
                    <img class="ForumThreadAttachment HalfWidth FullHeight" src={forumThread.message.attachments[0].url}></img>
                    <img class="ForumThreadAttachment HalfWidth FullHeight" style={{"left": "50%"}} src={forumThread.message.attachments[1].url}></img>
                </div>;
            } else if (forumThread.message.attachments.length == 3) {
                attachments = <div class="ForumThreadAttachments">
                    <img class="ForumThreadAttachment HalfWidth FullHeight" src={forumThread.message.attachments[0].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"left": "50%"}} src={forumThread.message.attachments[1].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"left": "50%", "top": "50%"}} src={forumThread.message.attachments[2].url}></img>
                </div>;
            } else if (forumThread.message.attachments.length == 4) {
                attachments = <div class="ForumThreadAttachments">
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" src={forumThread.message.attachments[0].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"left": "50%"}} src={forumThread.message.attachments[1].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"top": "50%"}} src={forumThread.message.attachments[2].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"left": "50%", "top": "50%"}} src={forumThread.message.attachments[3].url}></img>
                </div>;
            } else {
                attachments = <div class="ForumThreadAttachments">
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" src={forumThread.message.attachments[0].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"left": "50%"}} src={forumThread.message.attachments[1].url}></img>
                    <img class="ForumThreadAttachment HalfWidth HalfHeight" style={{"top": "50%"}} src={forumThread.message.attachments[2].url}></img>
                    <div class="ForumThreadAttachment HalfWidth HalfHeight DarkOverlay" style={{"left": "50%", "top": "50%"}} src={forumThread.message.attachments[3].url}>
                        <img class="ForumThreadAttachment FullWidth FullHeight DarkOverlay" src={forumThread.message.attachments[3].url}></img>
                        <span class="Bold ForumThreadAdditionalAttachmentsCount">+{forumThread.message.attachments.length - 3}</span>
                    </div>
                </div>;
            }
        }

        // Create the view.
        forumThread.forumThreadElement = this;
        return <div class="ForumThread" forumListIndex={this.props.listIndex} onClick={function() { window.open(forumThread.url) }}>
            <div class={mainContentsClass}>
                <div class="ForumThreadTitle">{forumThread.name}</div>
                <div class="ForumThreadPosterHeader">
                    <img class="ForumThreadPosterAvatar" src={forumThread.originalPoster.profilePicture}></img>
                    <span class="ForumThreadPosterName">{forumThread.originalPoster.displayName}</span>
                    <span class="ForumThreadCreateDate Secondary">{dateInformation}</span>
                </div>
                <div class={tags.length > 0 ? "ForumThreadTagContainer" : ""}>{tags}</div>
                <div class={attributes.length > 0 ? "ForumThreadTagContainer" : ""}>{attributes}</div>
                {messageContents}
                <div class="ForumThreadFooter">
                    <svg class="ForumThreadMessageCountIcon Secondary" role="img" width="14" height="14" viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z"></path></svg>
                    <span class="ForumThreadMessageCountText">{forumThread.messageCount}</span>
                    {reactions}
                </div>
            </div>
            {attachments}
        </div>
    }
}

class ForumList extends React.Component {
    /*
     * Creates the forum list.
     */
    constructor(props) {
        super(props);
        staticList = this;
    }

    /*
     * Refreshes the list.
     */
    refresh() {
        this.setState({});
    }

    /*
     * Returns the HTML structure of the element.
     */
    render() {
        // Display a message if there are no messages or an error occured.
        if (listResponse.message != null) {
            return <span class="ErrorMessage Secondary">An error occured: {listResponse.message}</span>
        }
        if (listResponse.threads.length == 0) {
            return <span class="ErrorMessage Secondary">There are no threads to display.</span>
        }

        // Save the filter.
        saveFilterData();

        // Build the forum list display.
        let forumThreads = [];
        for (let i = 0; i < listResponse.threads.length; i++) {
            if (!threadPassesFilter(listResponse.threads[i])) continue;
            forumThreads.push(<ForumListThread listIndex={i}></ForumListThread>)
        }
        if (forumThreads.length == 0) {
            forumThreads.push(<span class="ErrorMessage Secondary">No threads to display.</span>)
        }
        return <div>
            <ForumListFilterBar/>
            {forumThreads}
            <div class="BottomBarBackground">
                <div class="BottomBar">
                    <a href={gitHubUrl} target="_blank" rel="noopener">
                        <img class="BottomBarIcon" src="/img/github.svg"></img>
                    </a>
                    <span class="BottomBarText Secondary">Nexus Discord Forum List, hosted by {websiteHost}.</span>
                </div>
            </div>
        </div>
    }
}



// Load the initial filter.
window.addEventListener("popstate", loadFilterData);
loadFilterData();

// Sort the initial threads.
sortThreads()

// Render the forum list using React.
ReactDOM.render(
    <ForumList/>,
    document.getElementById("ContentsScroll")
);

// Load the messages.
setInterval(startLoadingMessages, 100);