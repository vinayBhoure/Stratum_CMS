classDiagram

    class User {
        +uuid id
        +string username
        +string email
        +string password
        +string clerkId
    }

    class Project {
        +uuid id
        +uuid userId
        +string title
        +string description
        +string mediaUrl
        +string githubUrl
        +string liveUrl
    }

    class Skill {
        +uuid id
        +uuid userId
        +string name
    }

    class Experience {
        +uuid id
        +uuid userId
        +string company
        +string role
        +date startDate
        +date endDate
        +string description
    }

    class Contact {
        +uuid id
        +uuid userId
        +string name
        +string email
        +string mobile
        +string address
        +string googleMapsUrl
    }

    class SocialAccount {
        +uuid id
        +uuid userId
        +string platform
        +string url
    }

    class Resume {
        +uuid id
        +uuid userId
        +string name
        +string pdfUrl
        +timestamp updatedAt
    }

    class Tag {
        +uuid id
        +string name
    }

    class ProjectTag {
        +uuid id
        +uuid projectId
        +uuid tagId
    }

    class ProjectSkill {
        +uuid id
        +uuid projectId
        +uuid skillId
    }

    class ExperienceSkill {
        +uuid id
        +uuid experienceId
        +uuid skillId
    }

    User "1" --> "*" Project
    User "1" --> "*" Skill
    User "1" --> "*" Experience
    User "1" --> "1" Contact
    User "1" --> "*" SocialAccount
    User "1" --> "1" Resume

    Project "1" --> "*" ProjectTag
    Tag "1" --> "*" ProjectTag

    Project "1" --> "*" ProjectSkill
    Skill "1" --> "*" ProjectSkill

    Experience "1" --> "*" ExperienceSkill
    Skill "1" --> "*" ExperienceSkill