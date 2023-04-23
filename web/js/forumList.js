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
            return new Date(a.createTime) > new Date(b.createTime) ? -1 : 1;
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
    "attributes": [],
    "tags": [],
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
        if (elementPositionY > (1.5 * windowHeight)) return;

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
 * Sorts the threads.
 */
function sortThreads() {
    listResponse.threads = listResponse.threads.sort(sortOptions[filterData.sortOption].sortFunction);
    if (staticList != null) {
        staticList.refresh();
    }
}

/*
 * Toggles the requested filter for an attribute.
 */
function toggleAttributeFilter(attributeName) {
    if (filterData.attributes[attributeName] == true) {
        filterData.attributes[attributeName] = false;
    } else if (filterData.attributes[attributeName] == false) {
        filterData.attributes[attributeName] = null;
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
        filterData.tags[tagId] = null;
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
        this.refresh = this.refresh.bind(this);
    }

    /*
     * Refreshes the filter view.
     */
    refresh() {
        this.setState({});
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

        // Return the bar.
        return <div class="ForumListFilterBar">
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

        // Build the forum list display.
        let forumThreads = [];
        for (let i = 0; i < listResponse.threads.length; i++) {
            forumThreads.push(<ForumListThread listIndex={i}></ForumListThread>)
        }
        return <div>
            <ForumListFilterBar/>
            {forumThreads}
        </div>
    }
}



// Sort the initial threads.
sortThreads()

// Render the forum list using React.
ReactDOM.render(
    <ForumList/>,
    document.getElementById("ContentsScroll")
);

// Load the messages.
setInterval(startLoadingMessages, 1000);