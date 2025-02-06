# User Stories and Acceptance Criteria

## Regular User Stories

### Mess Exploration

#### Story: Browse Nearby Messes

As a regular user,
I want to explore nearby messes,
So that I can find a suitable meal service provider

Acceptance Criteria:

- User can view a list of messes in their area
- Each mess card shows key information (name, location, rating)
- User can view mess details including membership plans
- User can see current rating and reviews
- User can filter messes by distance and rating
- Location services are properly integrated

#### Story: Request Membership

As a regular user,
I want to request membership to a mess,
So that I can start receiving their meal service

Acceptance Criteria:

- System validates user has no active memberships elsewhere
- System checks for existing reward points from previous memberships
- User can view available membership plans
- User can select desired membership duration
- User receives confirmation of request
- System tracks membership request status

### Profile Management

#### Story: Manage Profile Information

As a regular user,
I want to manage my profile information,
So that my personal details stay up to date

Acceptance Criteria:

- User can view current profile information
- User can edit personal details (name, contact, address)
- Changes are saved and reflected immediately
- Form validation ensures data quality
- User receives confirmation of successful updates

## Member Stories

### Meal Management

#### Story: View Daily Menu

As a mess member,
I want to view today's menu,
So that I can decide whether to have my meal at the mess

Acceptance Criteria:

- Member can view detailed menu for each meal type
- Menu clearly shows all available items
- Menu updates in real-time if changed by admin
- Member receives notifications for menu updates
- Menu shows nutritional information if available

#### Story: Generate Meal Pass

As a mess member,
I want to generate a meal pass,
So that I can claim my meal at the mess

Acceptance Criteria:

- System validates member's eligibility based on:
  - Active membership status
  - No planned absence for the meal
  - No mess closure
  - Valid meal timing
- Pass generates only for eligible meals
- Pass displays clear QR code or unique identifier
- Pass shows validity period
- System prevents duplicate pass generation

#### Story: Plan Absence

As a mess member,
I want to plan my absence in advance,
So that the mess can plan their preparations accordingly

Acceptance Criteria:

- Member can select absence dates within membership period
- Member can choose specific meal types
- System prevents backdated absence planning
- Member can view all planned absences
- Member can cancel planned absences
- Reward points are updated accordingly
- System prevents overlapping absence periods

#### Story: View Membership Status

As a mess member,
I want to check my membership status,
So that I can track my subscription and rewards

Acceptance Criteria:

- Member can view membership expiry date
- Display shows remaining days clearly
- Member can see current reward points
- History of reward point changes is available
- Renewal options are shown near expiry
- Member can view membership plan details

#### Story: Participate in Polls

As a mess member,
I want to participate in mess polls,
So that I can provide input on mess decisions

Acceptance Criteria:

- Member can view active polls
- Each poll shows clear description and options
- Member can select and submit their choice
- System prevents multiple votes
- Member can view their voting history
- Poll results are visible after voting

#### Story: Rate Mess Service

As a mess member,
I want to rate the mess service,
So that I can provide feedback on my experience

Acceptance Criteria:

- Member can provide rating on 1-5 scale
- Optional comment field available
- Member can edit their rating
- Rating immediately reflects in mess's overall score
- Member can view their rating history
- System validates member has active/recent membership

#### Story: View Upcoming Closures

As a mess member,
I want to view upcoming mess closures,
So that I can plan my meals accordingly

Acceptance Criteria:

- Member can see list of all upcoming closures
- Each closure shows start date, end date, and reason
- Closures are sorted chronologically
- Member receives notifications for new closures
- System shows how closure affects reward points
- Member can filter closures by date range

#### Story: Renew Membership

As a mess member,
I want to renew my expiring membership,
So that I can continue receiving mess services without interruption

Acceptance Criteria:

- System shows renewal option near membership expiry
- Member can view available renewal plans
- System checks for and applies available reward points
- Member can see how reward points affect renewal duration
- Member receives confirmation after renewal
- Renewal seamlessly extends from current end date
- System maintains reward points history

## Admin Stories

### Member Management

#### Story: Monitor Memberships

As a mess admin,
I want to monitor membership status,
So that I can manage my mess operations effectively

Acceptance Criteria:

- Admin can view all active memberships
- List shows expiring memberships
- Admin can view expired memberships
- Admin can cancel memberships if needed
- System shows member details and history
- Export functionality for member data

#### Story: Manage Reward Points

As a mess admin,
I want to manage member reward points,
So that I can provide benefits to loyal members

Acceptance Criteria:

- Admin can view current points for all members
- Admin can modify points with reason
- System logs all point modifications
- Automatic point updates for closures
- Point history available for each member

### Operations Management

#### Story: Manage Daily Menu

As a mess admin,
I want to manage the daily menu,
So that members know what meals will be served

Acceptance Criteria:

- Admin can create/edit menu for each meal type
- Changes reflect immediately for members
- Admin can copy menu from previous days
- System notifies members of changes
- Admin can schedule menus in advance

#### Story: Manage Closures

As a mess admin,
I want to manage mess closures,
So that members are informed of service unavailability

Acceptance Criteria:

- Admin can schedule future closures
- Admin can specify closure duration and reason
- System automatically adjusts reward points
- Members are notified of new closures
- Admin can cancel planned closures
- System handles reward point adjustments for cancellations

#### Story: Track Attendance

As a mess admin,
I want to track daily meal attendance,
So that I can plan meal preparations effectively

Acceptance Criteria:

- Admin can view expected attendance for each meal
- System shows absence plans from members
- Real-time updates as meal passes are generated
- Historical attendance data available
- Export functionality for attendance data

#### Story: Create and Monitor Polls

As a mess admin,
I want to create and monitor polls,
So that I can gather member feedback on mess decisions

Acceptance Criteria:

- Admin can create new polls with multiple options
- Admin can set poll duration
- Real-time view of voting results
- Export functionality for poll data
- Admin can close polls early if needed
- System notifies members of new polls

#### Story: Manage Mess Schedule

As a mess admin,
I want to manage the mess schedule,
So that members know meal timings

Acceptance Criteria:

- Admin can set different timings for each meal type
- Admin can modify schedule when needed
- Changes notify affected members
- Schedule visible to all users
- System validates no overlapping timings
- History of schedule changes maintained

#### Story: Track Member Absences

As a mess admin,
I want to view all planned member absences,
So that I can plan mess operations effectively

Acceptance Criteria:

- Admin can view all future planned absences
- List shows member name, dates, and meal types
- Admin can filter absences by date range
- Admin can export absence data
- System shows impact on daily attendance
- Admin can view absence history by member
- Absences are sorted chronologically

#### Story: Manage Membership Plans

As a mess admin,
I want to manage membership plans,
So that I can offer different subscription options to members

Acceptance Criteria:

- Admin can view all existing membership plans
- Admin can create new membership plans with:
  - Plan name and description
  - Duration in days
  - Price
  - Any special conditions or benefits
- Admin can edit existing plan details
- Admin can deactivate outdated plans
- System maintains existing memberships when plans change
- Admin can view which members are on each plan
- System shows plan popularity metrics
