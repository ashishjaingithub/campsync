# Agent Evaluation - Golden Test Cases

These cases define the expected behavior of the CampSync Assistant when interacting with the schedule.

## Case 1: Simple Addition
**Query**: "Add Creative Arts camp for Alex in Week 4."
**Initial State**: Alex exists, Week 4 is empty for Alex.
**Expected Tool Call**: `modify_schedule({ action: 'add', childId: 'alex-id', campId: 'art-id', weekIndex: 3 })`
**Expected Response**: Confirming the addition and noting any sibling sync bonuses.

## Case 2: Conflict Resolution
**Query**: "Move Alex's Soccer camp from Week 1 to Week 2. Oh wait, his brother Jordan is at Space Camp in Week 2, can they go together?"
**Initial State**: Alex at Soccer (Week 1), Jordan at Space Camp (Week 2).
**Expected Behavior**:
1. Agent checks availability of Space Camp in Week 2.
2. Agent identifies it's a good match due to sibling sync.
3. Agent suggests swapping Alex to Space Camp in Week 2.
**Expected Tool Call**: `modify_schedule(...)` for the swap.

## Case 3: Interest-Based Suggestion
**Query**: "Alex is bored in Week 6. Find him something involving robots nearby."
**Initial State**: Alex interests include 'Robotics', Week 6 is empty.
**Expected Behavior**:
1. Agent calls `search_local_camps({ interests: ['Robotics'], weekIndex: 5 })`.
2. Agent filters for zip code proximity.
3. Agent presents the top scored option.

## Case 4: Policy Enforcement
**Query**: "Schedule Alex for two camps in Week 3."
**Expected Response**: Politely decline and explain the "No Overlap" policy.
**Expected Tool Call**: None.
