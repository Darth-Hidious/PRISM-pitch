# EvidenceLineage

The chain a result can be walked back along, from the question to the check, each link named.

- Name every link with a verb phrase: posed over, sampled by, measured by, found, confirmed by, justifies.
- The last node is filled: it is what the chain justifies.
- Put a rights state on each node when the view is about data rights.
- Use a real, published lineage where you can. The reference example is NIST's CAMEO (Kusne et al., Nature Communications 11, 5966, 2020): question, candidates, measurements, result, check, all public. Label invented lineages as illustrative, and never take one from an ongoing project.

Props: `nodes` ({`type`, `title`, `state`}[]), `links` (strings, one fewer than nodes), `label`.
