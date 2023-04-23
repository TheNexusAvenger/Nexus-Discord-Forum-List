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



class ForumListThread extends React.Component {
    /*
     * Creates the forum list thread.
     */
    constructor(props) {
        super(props);
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
        if (forumThread.accessState.isLocked) {
            attributes.push(<span class="ForumThreadTag">🔒 Locked</span>)
        }
        if (forumThread.accessState.isArchived) {
            attributes.push(<span class="ForumThreadTag">📦 Archived</span>)
        }

        // Build the message.
        let messageContents = <div class="ForumTextContents">Loading...</div>;
        if (forumThread.message != null) {
            let message = forumThread.message.message;
            if (message == null || message == "") {
                message = "*No message.*"
            }
            messageContents = <div class="ForumTextContents" dangerouslySetInnerHTML={{__html: converter.makeHtml(message)}}></div>;
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
        return <div class="ForumThread" onClick={function() { window.open(forumThread.url) }}>
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
        return <div>{forumThreads}</div>
    }
}



// Render the forum list using React.
ReactDOM.render(
    <ForumList/>,
    document.getElementById("ContentsScroll")
);